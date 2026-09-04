@echo off
cd /d "%~dp0"
if not exist node_modules (
  echo Installing dependencies (first time only, needs internet)...
  call npm install --no-audit
)
if not exist dist (
  echo Building the offline app (first time only)...
  call npm run build
)
echo Serving offline build at http://localhost:3000 ...
start "" http://localhost:3000
call npm run preview
