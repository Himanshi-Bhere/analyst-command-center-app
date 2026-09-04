@echo off
cd /d "%~dp0"
if not exist node_modules (
  echo Installing dependencies (first time only)...
  call npm install --no-audit
)
echo Starting Analyst Command Center at http://localhost:3000 ...
start "" http://localhost:3000
call npm run dev
