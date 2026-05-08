#!/usr/bin/env node
// Quality gates static analyzer for impeccable.
//
// Zero-dependency Node ESM script. Reads files via fs, scans with regex,
// emits JSON. Used by skill/reference/verify.md and (via subprocess) by
// claude-code's quality-checks plugin.
//
// Usage:
//   node quality-gates.mjs --preflight
//   node quality-gates.mjs --gate=security    [--scope=<glob,glob>] [--diff]
//   node quality-gates.mjs --gate=ui-craft    [--scope=<glob,glob>] [--diff]
//   node quality-gates.mjs --gate=perf        [--scope=<glob,glob>] [--diff]
//   node quality-gates.mjs --gate=streamlining [--scope=<glob,glob>] [--diff]
//   node quality-gates.mjs --gate=all         [--scope=<glob,glob>] [--diff]
//
// --diff resolves scope as `git diff --name-only main...HEAD` (or staged with
// --staged). Otherwise --scope is a comma-separated list of glob roots; if
// neither is given, scans tracked files under cwd.
//
// Output is JSON on stdout. Exit code 0 always (orchestrator decides verdicts).

import { readFileSync, statSync } from "node:fs";
import { execSync } from "node:child_process";
import { resolve, relative, extname, sep } from "node:path";

const args = parseArgs(process.argv.slice(2));

if (args.preflight) {
  process.stdout.write(JSON.stringify(preflight(), null, 2) + "\n");
  process.exit(0);
}

const gate = args.gate || "all";
const files = resolveFiles(args);
const patterns = patternsForGate(gate);
const findings = scan(files, patterns);

process.stdout.write(
  JSON.stringify(
    {
      gate,
      filesScanned: files.length,
      findings,
      summary: summarize(findings),
    },
    null,
    2,
  ) + "\n",
);
process.exit(0);

// ---------------------------------------------------------------------------
// Args
// ---------------------------------------------------------------------------

function parseArgs(argv) {
  const out = { preflight: false, diff: false, staged: false };
  for (const a of argv) {
    if (a === "--preflight") out.preflight = true;
    else if (a === "--diff") out.diff = true;
    else if (a === "--staged") out.staged = true;
    else if (a.startsWith("--gate=")) out.gate = a.slice("--gate=".length);
    else if (a.startsWith("--scope=")) out.scope = a.slice("--scope=".length);
  }
  return out;
}

// ---------------------------------------------------------------------------
// Preflight
// ---------------------------------------------------------------------------

function preflight() {
  const cwd = process.cwd();
  const out = {
    cwd,
    framework: "unknown",
    packageManager: "unknown",
    commands: {},
    hasDesignTokens: false,
    tokensSource: null,
  };

  // Package manager: lockfile presence.
  if (exists("pnpm-lock.yaml")) out.packageManager = "pnpm";
  else if (exists("bun.lock") || exists("bun.lockb")) out.packageManager = "bun";
  else if (exists("yarn.lock")) out.packageManager = "yarn";
  else if (exists("package-lock.json")) out.packageManager = "npm";

  // Framework + commands: parse package.json scripts.
  if (exists("package.json")) {
    try {
      const pkg = JSON.parse(readFileSync("package.json", "utf8"));
      const deps = { ...(pkg.dependencies || {}), ...(pkg.devDependencies || {}) };
      if (deps.next) out.framework = "next";
      else if (deps.astro) out.framework = "astro";
      else if (deps["@sveltejs/kit"]) out.framework = "sveltekit";
      else if (deps["@remix-run/react"]) out.framework = "remix";
      else if (deps.vite) out.framework = "vite";
      else if (deps.expo) out.framework = "expo";
      else if (deps.react || deps.vue || deps.svelte) out.framework = "plain";

      const scripts = pkg.scripts || {};
      const pm = out.packageManager;
      const exec = (s) => (pm === "unknown" ? `npm run ${s}` : `${pm} ${s}`);
      if (scripts.typecheck) out.commands.typecheck = exec("typecheck");
      else if (deps.typescript && exists("tsconfig.json"))
        out.commands.typecheck =
          pm === "unknown" ? "npx tsc --noEmit" : `${pm} exec tsc --noEmit`;
      if (scripts.lint) out.commands.lint = exec("lint");
      if (scripts.test) out.commands.test = exec("test");
      if (scripts.build) out.commands.build = exec("build");
    } catch {
      // ignore parse errors
    }
  }

  // Tokens.
  const tokenCandidates = [
    "tailwind.config.ts",
    "tailwind.config.js",
    "tailwind.config.mjs",
    "tailwind.config.cjs",
    "DESIGN.md",
    "design.md",
    "src/tokens.ts",
    "src/tokens.css",
    "src/styles/tokens.css",
    "src/styles/tokens.ts",
    "app/globals.css",
  ];
  for (const c of tokenCandidates) {
    if (exists(c)) {
      out.hasDesignTokens = true;
      out.tokensSource = c;
      break;
    }
  }

  return out;
}

function exists(rel) {
  try {
    statSync(resolve(process.cwd(), rel));
    return true;
  } catch {
    return false;
  }
}

// ---------------------------------------------------------------------------
// Scope resolution
// ---------------------------------------------------------------------------

function resolveFiles(args) {
  if (args.diff || args.staged) {
    try {
      const cmd = args.staged
        ? "git diff --name-only --cached"
        : `git diff --name-only ${getMergeBase()}...HEAD`;
      const out = execSync(cmd, { encoding: "utf8", cwd: process.cwd() });
      return out
        .split("\n")
        .map((l) => l.trim())
        .filter((l) => l && exists(l) && isScannableFile(l));
    } catch {
      return [];
    }
  }

  if (args.scope) {
    return args.scope
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
      .flatMap(expandGlob)
      .filter(isScannableFile);
  }

  // Default: all tracked files.
  try {
    const out = execSync("git ls-files", { encoding: "utf8", cwd: process.cwd() });
    return out
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l && isScannableFile(l));
  } catch {
    return [];
  }
}

function getMergeBase() {
  for (const candidate of ["main", "master"]) {
    try {
      execSync(`git rev-parse --verify origin/${candidate}`, {
        cwd: process.cwd(),
        stdio: "ignore",
      });
      return `origin/${candidate}`;
    } catch {
      // try next
    }
  }
  return "HEAD~1";
}

function expandGlob(pattern) {
  // Minimal glob: literal path -> [path]; otherwise let git ls-files expand.
  if (!pattern.includes("*") && !pattern.includes("?")) {
    return exists(pattern) ? [pattern] : [];
  }
  try {
    const out = execSync(
      `git ls-files -- ${JSON.stringify(pattern)}`,
      { encoding: "utf8", cwd: process.cwd() },
    );
    return out.split("\n").map((l) => l.trim()).filter(Boolean);
  } catch {
    return [];
  }
}

const SCANNABLE_EXTS = new Set([
  ".ts",
  ".tsx",
  ".js",
  ".jsx",
  ".mjs",
  ".cjs",
  ".vue",
  ".svelte",
  ".astro",
  ".css",
  ".scss",
  ".sass",
  ".less",
  ".html",
  ".htm",
  ".mdx",
  ".py",
  ".yml",
  ".yaml",
]);

function isScannableFile(rel) {
  // Skip generated dirs.
  const skip = ["node_modules", "dist", "build", ".next", ".astro", "coverage"];
  if (skip.some((s) => rel.split(sep).includes(s) || rel.includes(`/${s}/`))) {
    return false;
  }
  return SCANNABLE_EXTS.has(extname(rel).toLowerCase());
}

// ---------------------------------------------------------------------------
// Patterns
// ---------------------------------------------------------------------------

// Each pattern: { rule, gate, severity, regex, message, appliesTo: extSet|null }
const PATTERNS = [
  // Gate 1 — Security ---------------------------------------------------------
  pat("eval-injection", "security", "P0", /\beval\s*\(/),
  pat("new-function-injection", "security", "P0", /\bnew\s+Function\s*\(/),
  pat("document-write", "security", "P0", /\bdocument\.write\s*\(/),
  pat(
    "react-dangerous-html",
    "security",
    "P1",
    /dangerouslySetInnerHTML/,
  ),
  pat("innerHTML-assignment", "security", "P1", /\.innerHTML\s*=/),
  pat(
    "child-process-exec",
    "security",
    "P1",
    /\b(?:child_process\.exec|exec|execSync)\s*\(\s*[`'"]/,
  ),
  pat(
    "os-system-shell",
    "security",
    "P1",
    /\b(?:os\.system|os\.popen|subprocess\.[a-zA-Z_]+\([^)]*shell\s*=\s*True)/,
    [".py"],
  ),
  pat(
    "pickle-deserialization",
    "security",
    "P1",
    /\bpickle\.loads?\s*\(/,
    [".py"],
  ),
  pat(
    "yaml-unsafe-load",
    "security",
    "P1",
    /\byaml\.load\s*\((?!.*Loader\s*=\s*[a-zA-Z_]*Safe)/,
    [".py"],
  ),
  pat(
    "github-actions-injection",
    "security",
    "P1",
    /\$\{\{\s*github\.event\.(?:issue|pull_request|comment|review|review_comment|head_commit)\.(?:title|body|message|name)/i,
    [".yml", ".yaml"],
  ),

  // Gate 3 — UI craft (absolute bans + tinted neutrals) ----------------------
  pat(
    "gradient-text",
    "ui-craft",
    "P1",
    /(?:-webkit-)?background-clip:\s*text/i,
    [".css", ".scss", ".sass", ".less", ".tsx", ".jsx", ".vue", ".svelte", ".astro", ".html", ".htm"],
  ),
  pat(
    "side-stripe-border",
    "ui-craft",
    "P1",
    /(?:border-(?:left|right):\s*[2-9]\d*px|\bborder-[lr]-[248](?:\s|$|["'`]))/i,
    [".css", ".scss", ".sass", ".less", ".tsx", ".jsx", ".vue", ".svelte", ".astro", ".html", ".htm"],
  ),
  pat(
    "glassmorphism",
    "ui-craft",
    "P2",
    /(?:backdrop-filter:\s*[^;]*blur|\bbackdrop-blur(?:-[a-z0-9]+)?\b)/i,
    [".css", ".scss", ".sass", ".less", ".tsx", ".jsx", ".vue", ".svelte", ".astro", ".html", ".htm"],
  ),
  pat(
    "hardcoded-pure-black",
    "ui-craft",
    "P2",
    /(#000(?![0-9a-fA-F])|#000000\b|rgb\(\s*0\s*,\s*0\s*,\s*0\s*\))/,
    [".css", ".scss", ".sass", ".less", ".tsx", ".jsx", ".vue", ".svelte", ".astro", ".html", ".htm"],
  ),
  pat(
    "hardcoded-pure-white",
    "ui-craft",
    "P2",
    /(#fff(?![0-9a-fA-F])|#ffffff\b|rgb\(\s*255\s*,\s*255\s*,\s*255\s*\))/i,
    [".css", ".scss", ".sass", ".less", ".tsx", ".jsx", ".vue", ".svelte", ".astro", ".html", ".htm"],
  ),
  pat(
    "em-dash-in-copy",
    "ui-craft",
    "P3",
    /—/,
    [".tsx", ".jsx", ".vue", ".svelte", ".astro", ".html", ".htm", ".mdx", ".md"],
  ),

  // Gate 5 — Performance ------------------------------------------------------
  pat(
    "layout-property-animation",
    "perf",
    "P1",
    /(?:animation|transition):\s*[^;]*\b(?:width|height|top|left|right|bottom|margin|padding|border-width)\b/i,
    [".css", ".scss", ".sass", ".less"],
  ),
  pat(
    "img-without-dimensions",
    "perf",
    "P1",
    /<img(?![^>]*\b(?:width|height|aspect-ratio|aspectRatio)=)[^>]*src=/i,
    [".tsx", ".jsx", ".vue", ".svelte", ".astro", ".html", ".htm"],
  ),

  // Gate 7 — Streamlining (lightweight static signals) -----------------------
  pat(
    "hard-coded-pixel-typography",
    "streamlining",
    "P2",
    /font-size:\s*\d{2,}px/i,
    [".css", ".scss", ".sass", ".less"],
  ),
];

function pat(rule, gate, severity, regex, exts = null) {
  return {
    rule,
    gate,
    severity,
    regex,
    appliesTo: exts ? new Set(exts.map((e) => e.toLowerCase())) : null,
  };
}

function patternsForGate(gate) {
  if (gate === "all") return PATTERNS;
  return PATTERNS.filter((p) => p.gate === gate);
}

// ---------------------------------------------------------------------------
// Scan
// ---------------------------------------------------------------------------

function scan(files, patterns) {
  const findings = [];
  for (const file of files) {
    let content;
    try {
      content = readFileSync(file, "utf8");
    } catch {
      continue;
    }
    const ext = extname(file).toLowerCase();
    const lines = content.split("\n");
    for (const p of patterns) {
      if (p.appliesTo && !p.appliesTo.has(ext)) continue;
      // Reset lastIndex for global regex, though we don't use /g here.
      const re = new RegExp(p.regex.source, p.regex.flags);
      for (let i = 0; i < lines.length; i++) {
        if (re.test(lines[i])) {
          findings.push({
            file: relative(process.cwd(), resolve(file)),
            line: i + 1,
            rule: p.rule,
            gate: p.gate,
            severity: p.severity,
            evidence: lines[i].trim().slice(0, 200),
          });
          // Don't break: a line might match multiple patterns; collect each.
        }
      }
    }
  }
  return findings;
}

function summarize(findings) {
  const out = { total: findings.length, byGate: {}, bySeverity: {} };
  for (const f of findings) {
    out.byGate[f.gate] = (out.byGate[f.gate] || 0) + 1;
    out.bySeverity[f.severity] = (out.bySeverity[f.severity] || 0) + 1;
  }
  return out;
}
