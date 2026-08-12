@echo off
chcp 65001 >nul
title Building Windows EXE
echo.
echo ============================================
echo   Building Windows installer
echo ============================================
echo.

where node >nul 2>nul
if errorlevel 1 (
  echo ERROR: Node.js is not installed.
  echo Install Node.js LTS and run this file again.
  pause
  exit /b 1
)

where npm >nul 2>nul
if errorlevel 1 (
  echo ERROR: npm was not found.
  pause
  exit /b 1
)

echo [1/4] Installing dependencies...
call npm install
if errorlevel 1 goto :failed

echo.
echo [2/4] Running QA...
call npm run qa
if errorlevel 1 goto :failed

echo.
echo [3/4] Building application...
call npm run build
if errorlevel 1 goto :failed

echo.
echo [4/4] Creating Windows installer...
call npx electron-builder --win nsis
if errorlevel 1 goto :failed

echo.
echo ============================================
echo SUCCESS
echo Installer created inside the "release" folder.
echo ============================================
echo.
explorer release
pause
exit /b 0

:failed
echo.
echo ============================================
echo BUILD FAILED
echo Copy the error shown above and send it to ChatGPT.
echo ============================================
pause
exit /b 1
