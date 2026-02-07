@echo off
REM QuickFilterBy Build Script for Windows
REM This script builds the QuickFilterBy.xpi package

setlocal enabledelayedexpansion

REM Display usage
if "%~1"=="/?" goto :usage
if "%~1"=="help" goto :usage
if "%~1"=="--help" goto :usage

REM Set default command
set COMMAND=%~1
if "%COMMAND%"=="" set COMMAND=build

REM Execute command
if "%COMMAND%"=="build" goto :build
if "%COMMAND%"=="clean" goto :clean
if "%COMMAND%"=="help" goto :usage
if "%COMMAND%"=="/?" goto :usage

echo Error: Unknown command '%COMMAND%'
echo.
goto :usage

:clean
echo Cleaning build artifacts...
if exist "dist" rmdir /s /q dist
echo Clean completed.
goto :end

:build
echo Building QuickFilterBy extension...

REM Create dist directory
if not exist "dist" mkdir dist

REM Create zip package
echo Creating package...
REM Using PowerShell Compress-Archive for better compatibility
powershell -Command "& { $files = @('*.js','*.json','_locales','api','src'); Compress-Archive -Path $files -DestinationPath 'dist\QuickFilterBy.zip' -Force }" 2>nul

if %errorlevel% neq 0 (
    echo Build failed: Could not create package
    exit /b 1
)

REM Rename to .xpi
move dist\QuickFilterBy.zip dist\QuickFilterBy.xpi >nul

if not exist "dist\QuickFilterBy.xpi" (
    echo Build failed: Package not created
    exit /b 1
)

REM Generate SHA-256 checksum
echo Generating SHA-256 checksum...
certutil -hashfile dist\QuickFilterBy.xpi SHA256 > dist\QuickFilterBy.xpi.sha256

REM Display file info
echo Build completed successfully!
echo   Package: dist\QuickFilterBy.xpi
echo   Checksum: dist\QuickFilterBy.xpi.sha256
goto :end

:usage
echo QuickFilterBy Build Script
echo.
echo Usage: %~nx0 [command]
echo.
echo Commands:
echo   build    Build the extension package (default)
echo   clean    Clean build artifacts
echo   help     Show this help message
echo.
echo Examples:
echo   %~nx0 build
echo   %~nx0
echo   %~nx0 clean

:end
endlocal
