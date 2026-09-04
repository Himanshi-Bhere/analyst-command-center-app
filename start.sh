#!/usr/bin/env bash
cd "$(dirname "$0")"
[ -d node_modules ] || { echo "Installing dependencies (first time only)..."; npm install --no-audit; }
echo "Starting Analyst Command Center at http://localhost:3000 ..."
(sleep 2; xdg-open http://localhost:3000 2>/dev/null || open http://localhost:3000 2>/dev/null) &
npm run dev
