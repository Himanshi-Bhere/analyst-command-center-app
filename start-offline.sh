#!/usr/bin/env bash
cd "$(dirname "$0")"
[ -d node_modules ] || { echo "Installing dependencies (first time only, needs internet)..."; npm install --no-audit; }
[ -d dist ] || { echo "Building the offline app (first time only)..."; npm run build; }
echo "Serving offline build at http://localhost:3000 ..."
(sleep 2; xdg-open http://localhost:3000 2>/dev/null || open http://localhost:3000 2>/dev/null) &
npm run preview
