# Install

Three steps.

## 1. Copy the bundle

```bash
cp -r path/to/quality-checks ./
cp path/to/.claude/commands/quality-checks.md .claude/commands/
mkdir -p .github/workflows
cp path/to/.github/workflows/quality-checks.yml .github/workflows/
```

## 2. Self-test

```bash
chmod +x quality-checks/scripts/check.sh quality-checks/tests/run-tests.sh
quality-checks/tests/run-tests.sh
```

Expected: `13 passed, 0 failed`. Requires `ripgrep` (`brew install ripgrep` or `apt-get install ripgrep`).

## 3. Run the gate

```bash
quality-checks/scripts/check.sh
```

Exit 0 pass, 1 P0/P1 finding.

## Optional: invoke the full pipeline

```
/quality-checks
```

Runs the nine-phase pipeline through Claude Code: security judgment, design critique, accessibility heuristics, resilience review.

## Configuration

| Var | Default | Effect |
|-----|---------|--------|
| `QC_ROOT` | `$(pwd)` | Root to scan |
| `QC_TARGETS` | auto-detected | Paths to scan |
| `QC_JSON` | (none) | JSON output path |
| `QC_STRICT` | `0` | P2 also fails when `1` |
| `QC_QUIET` | `0` | Suppress per-finding output when `1` |
