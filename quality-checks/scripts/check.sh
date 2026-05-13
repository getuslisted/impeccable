#!/usr/bin/env bash
# Quality Checks — deterministic gate.
#
# Runs the grep-based subset of the pipeline.
# Exit 0 pass, 1 P0/P1 finding, 2 config error.
# Env: QC_ROOT, QC_TARGETS, QC_JSON, QC_STRICT, QC_QUIET.

set -euo pipefail

ROOT="${QC_ROOT:-$(pwd)}"
JSON="${QC_JSON:-}"
STRICT="${QC_STRICT:-0}"
QUIET="${QC_QUIET:-0}"

cd "$ROOT"

if [ -z "${QC_TARGETS:-}" ]; then
  CANDIDATES=()
  for d in src site app pages content components layouts public README.md README.npm.md; do
    [ -e "$d" ] && CANDIDATES+=("$d")
  done
  if [ ${#CANDIDATES[@]} -eq 0 ]; then
    QC_TARGETS="."
  else
    QC_TARGETS="${CANDIDATES[*]}"
  fi
fi

if command -v rg >/dev/null 2>&1; then
  GREP_CMD="rg --pcre2 --no-heading --color=never --line-number"
  GREP_I="-i"
  GREP_EXCLUDE="--glob=!node_modules --glob=!.git --glob=!dist --glob=!build --glob=!.next --glob=!.astro --glob=!coverage --glob=!*.lock --glob=!*.lockb --glob=!quality-checks/**"
else
  GREP_CMD="grep -E -r --line-number --color=never"
  GREP_I="-i"
  GREP_EXCLUDE="--exclude-dir=node_modules --exclude-dir=.git --exclude-dir=dist --exclude-dir=build --exclude-dir=.next --exclude-dir=.astro --exclude-dir=coverage --exclude-dir=quality-checks"
fi

FINDINGS_JSON=""
TOTAL_P0=0
TOTAL_P1=0
TOTAL_P2=0

emit_finding() {
  local sev="$1" id="$2" label="$3" file="$4" line="$5" snippet="$6"
  case "$sev" in
    P0) TOTAL_P0=$((TOTAL_P0 + 1));;
    P1) TOTAL_P1=$((TOTAL_P1 + 1));;
    P2) TOTAL_P2=$((TOTAL_P2 + 1));;
  esac
  if [ "$QUIET" != "1" ]; then
    printf "  [%s] %s — %s:%s\n" "$sev" "$label" "$file" "$line"
    [ -n "$snippet" ] && printf "        %s\n" "$snippet"
  fi
  if [ -n "$JSON" ]; then
    local esc_snip
    esc_snip=$(printf '%s' "$snippet" | sed 's/\\/\\\\/g; s/"/\\"/g; s/\t/\\t/g')
    local obj
    obj=$(printf '{"id":"%s","severity":"%s","label":"%s","file":"%s","line":%s,"snippet":"%s"}' \
      "$id" "$sev" "$label" "$file" "$line" "$esc_snip")
    if [ -z "$FINDINGS_JSON" ]; then FINDINGS_JSON="$obj"; else FINDINGS_JSON="$FINDINGS_JSON,$obj"; fi
  fi
}

run_check() {
  local id="$1" label="$2" severity="$3" pattern="$4" ci_flag="${5:-}"
  local hits
  if [ "$ci_flag" = "ci" ]; then
    hits=$($GREP_CMD $GREP_I $GREP_EXCLUDE -e "$pattern" $QC_TARGETS 2>/dev/null || true)
  else
    hits=$($GREP_CMD $GREP_EXCLUDE -e "$pattern" $QC_TARGETS 2>/dev/null || true)
  fi
  if [ -z "$hits" ]; then return 0; fi
  if [ "$QUIET" != "1" ]; then
    printf "[%s] %s (%s)\n" "$severity" "$label" "$id"
  fi
  while IFS= read -r row; do
    [ -z "$row" ] && continue
    local file line snippet
    file=$(printf '%s' "$row" | awk -F: '{print $1}')
    line=$(printf '%s' "$row" | awk -F: '{print $2}')
    snippet=$(printf '%s' "$row" | cut -d: -f3- | sed 's/^[[:space:]]*//;s/[[:space:]]*$//')
    [ -z "$line" ] && line=0
    [ -z "$file" ] && continue
    emit_finding "$severity" "$id" "$label" "$file" "$line" "$snippet"
  done <<< "$hits"
}

DICTION='\b(delve|delves|delved|delving|seamless(ly)?|robust(ness)?|elevate[sd]?|empower[sd]?|underscore[sd]?|pivotal|tapestry|load-bearing|highest-leverage|biggest unlock|reflex defaults|collapses into monoculture)\b'
THROAT='\b(in today.s|gone are the days|whether you.re|let.s dive in)\b'
CLOSERS='\b(in summary|in conclusion)\b'
TRANSITIONS='\b(moreover|furthermore)\b'
EM_DASH='(—|&mdash;|&#8212;|&#x2014;)'

run_check "qc-071" "Banned diction"     "P1" "$DICTION"     "ci"
run_check "qc-072" "Throat-clearing"    "P2" "$THROAT"      "ci"
run_check "qc-070" "Banned closer"      "P2" "$CLOSERS"     "ci"
run_check "qc-070" "Banned transition"  "P2" "$TRANSITIONS" "ci"
run_check "qc-070" "Em dash"            "P1" "$EM_DASH"

SIDE_STRIPE='border-(left|right):\s*(0?\.[1-9]+rem|[2-9]px|[1-9][0-9]+px)'
GRADIENT_TEXT='background-clip:\s*text|-webkit-background-clip:\s*text'
LAYOUT_ANIM='(transition|animation)(-property)?:[^;]*\b(width|height|padding|margin|top|left|right|bottom)\b'
PURE_BW='(:|=|,|\s)\s*#(000|fff|000000|ffffff)(\b|;|\s|"|\))'

run_check "qc-001" "Side-stripe border"      "P1" "$SIDE_STRIPE"   "ci"
run_check "qc-002" "Gradient text"           "P1" "$GRADIENT_TEXT" "ci"
run_check "qc-009" "Layout-property anim"    "P1" "$LAYOUT_ANIM"   "ci"
run_check "qc-007" "Pure black or white"     "P2" "$PURE_BW"       "ci"

OUTLINE_NONE='outline:\s*(none|0)\s*;'
DIV_ONCLICK='<div[^>]*on[Cc]lick='

run_check "qc-042" "outline: none directive" "P0" "$OUTLINE_NONE" "ci"
run_check "qc-043" "<div onClick>"           "P0" "$DIV_ONCLICK"

DANGER_HTML='dangerouslySetInnerHTML'
V_HTML='v-html\s*='
SVELTE_HTML='\{@html\s'

run_check "qc-080" "dangerouslySetInnerHTML" "P0" "$DANGER_HTML"
run_check "qc-081" "v-html"                  "P0" "$V_HTML"
run_check "qc-081" "Svelte {@html}"          "P0" "$SVELTE_HTML"

if [ "$QUIET" != "1" ]; then
  printf "\n"
  printf "Quality Checks (deterministic) — P0=%d P1=%d P2=%d\n" "$TOTAL_P0" "$TOTAL_P1" "$TOTAL_P2"
fi

if [ -n "$JSON" ]; then
  printf '{"version":"1.1.0","p0":%d,"p1":%d,"p2":%d,"findings":[%s]}' \
    "$TOTAL_P0" "$TOTAL_P1" "$TOTAL_P2" "$FINDINGS_JSON" > "$JSON"
fi

FAIL=0
if [ "$TOTAL_P0" -gt 0 ]; then FAIL=1; fi
if [ "$TOTAL_P1" -gt 0 ]; then FAIL=1; fi
if [ "$STRICT" = "1" ] && [ "$TOTAL_P2" -gt 0 ]; then FAIL=1; fi

if [ "$FAIL" -eq 0 ]; then
  [ "$QUIET" != "1" ] && echo "Status: PASS"
  exit 0
else
  [ "$QUIET" != "1" ] && echo "Status: FAIL — run /quality-checks for the full report"
  exit 1
fi
