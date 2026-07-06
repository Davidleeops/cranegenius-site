#!/usr/bin/env bash
# SessionStart hook — rehydrate tooling in a fresh ephemeral Claude Code container.
# Best-effort and non-fatal: dependency or network failures should not block startup.
set +e
cd "${CLAUDE_PROJECT_DIR:-$(cd "$(dirname "$0")/../.." && pwd)}" || exit 0

# Vercel CLI for repos with Vercel deployment config.
command -v vercel >/dev/null 2>&1 || npm i -g vercel >/dev/null 2>&1

echo "session-setup: ready" >&2
exit 0
