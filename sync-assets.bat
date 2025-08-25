@echo off
REM Terminal Grounds Asset Pipeline Sync
REM Automatically syncs assets from the main repository to website

echo.
echo ========================================
echo  Terminal Grounds Asset Pipeline
echo ========================================
echo.

REM Check if Node.js is available
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

REM Change to website directory
cd /d "%~dp0"

REM Check if Terminal-Grounds repository exists
if not exist "..\Terminal-Grounds" (
    echo ERROR: Terminal-Grounds repository not found!
    echo Expected location: ..\Terminal-Grounds
    echo.
    echo Please ensure the Terminal-Grounds repository is cloned
    echo in the parent directory of this website repository.
    pause
    exit /b 1
)

REM Create scripts directory if it doesn't exist
if not exist "scripts" mkdir scripts

REM Run the asset pipeline
echo Running asset sync...
node scripts/asset-pipeline.js

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo  Asset Sync Completed Successfully!
    echo ========================================
    echo.
    echo Check site\assets\images\ for updated assets
    echo Manifest generated at site\assets\images\manifest.json
) else (
    echo.
    echo ========================================
    echo  Asset Sync Failed!
    echo ========================================
    echo.
    echo Please check the error messages above
)

echo.
pause