#!/usr/bin/env bash
set -uo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
QC_ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
CHECK="$QC_ROOT_DIR/scripts/check.sh"
FIXTURES="$SCRIPT_DIR/fixtures"

if [ ! -x "$CHECK" ]; then
  echo "FAIL: $CHECK is not executable"; exit 1
fi

FAIL=0; PASS=0; FAILED_TESTS=()
TMPDIR="$(mktemp -d)"
trap 'rm -rf "$TMPDIR"' EXIT

run_test() {
  local name="$1" fixture="$2" expect="$3"
  local json_name; json_name=$(echo "$name" | tr '/' '_')
  local json="$TMPDIR/${json_name}.json"
  QC_ROOT="$fixture" QC_TARGETS="." QC_JSON="$json" QC_QUIET=1 QC_STRICT=1 "$CHECK" >/dev/null 2>&1
  local exit_code=$?
  if [ "$expect" = "flag" ]; then
    if [ "$exit_code" -eq 1 ]; then PASS=$((PASS + 1)); printf "  PASS  %s (correctly flagged)\n" "$name"
    else FAIL=$((FAIL + 1)); FAILED_TESTS+=("$name: expected flag, got $exit_code"); printf "  FAIL  %s (expected flag, got %s)\n" "$name" "$exit_code"
    fi
  else
    if [ "$exit_code" -eq 0 ]; then PASS=$((PASS + 1)); printf "  PASS  %s (correctly clean)\n" "$name"
    else FAIL=$((FAIL + 1)); FAILED_TESTS+=("$name: expected pass, got $exit_code"); printf "  FAIL  %s (expected pass, got %s)\n" "$name" "$exit_code"
      [ -f "$json" ] && printf "        findings: %s\n" "$(cat "$json")"
    fi
  fi
}

echo "Quality Checks — test suite"; echo
echo "should-flag fixtures (each must be detected):"
for d in "$FIXTURES/should-flag"/*/; do
  [ -d "$d" ] || continue
  run_test "should-flag/$(basename "$d")" "$d" "flag"
done
echo; echo "should-pass fixtures (each must be clean):"
for d in "$FIXTURES/should-pass"/*/; do
  [ -d "$d" ] || continue
  run_test "should-pass/$(basename "$d")" "$d" "pass"
done
echo; echo "Results: $PASS passed, $FAIL failed"
if [ "$FAIL" -gt 0 ]; then echo "Failures:"; for t in "${FAILED_TESTS[@]}"; do echo "  - $t"; done; exit 1; fi
exit 0
