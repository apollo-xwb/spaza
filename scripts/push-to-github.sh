#!/usr/bin/env bash
set -euo pipefail

REPO_NAME="${1:-shops-intelligence-map}"
VISIBILITY="${2:-public}"

if [[ -z "${GITHUB_TOKEN:-}" && -z "${GH_TOKEN:-}" ]]; then
  echo "Error: Set GITHUB_TOKEN or GH_TOKEN with repo scope."
  exit 1
fi

export GH_TOKEN="${GITHUB_TOKEN:-$GH_TOKEN}"

cd "$(dirname "$0")/.."

/exec-daemon/gh auth status 2>/dev/null || echo "$GH_TOKEN" | /exec-daemon/gh auth login --with-token

if git remote get-url origin &>/dev/null; then
  echo "Remote origin already configured:"
  git remote -v
else
  echo "Creating GitHub repository: $REPO_NAME ($VISIBILITY)"
  /exec-daemon/gh repo create "$REPO_NAME" \
    --"$VISIBILITY" \
    --source=. \
    --remote=origin \
    --description "Full-screen quantifiable shop intelligence map for South Africa" \
    --push
fi

echo "Done. Repository URL:"
/exec-daemon/gh repo view --json url -q .url
