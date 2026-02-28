@echo off
cd /d "%~dp0"
echo Starting API server with tsx directly...
npx tsx src/index.ts
pause
