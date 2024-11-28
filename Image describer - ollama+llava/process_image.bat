@echo off
setlocal enabledelayedexpansion

:: Store the script's directory path - equivalent to SCRIPT_DIR in bash
set "SCRIPT_DIR=%~dp0"
set "SCRIPT_DIR=%SCRIPT_DIR:~0,-1%"

:: Define Windows console colors (different from bash color codes)
set "BLUE=[94m"
set "GREEN=[92m"
set "BOLD=[1m"
set "NC=[0m"

:: Title and console configuration
title Image Processing Launcher
:: Enable larger console buffer for better logging
mode con: cols=100 lines=30

:: Function to show the header (called via GOTO)
:show_header
cls
echo %BOLD%================================%NC%
echo %BOLD%   Image Processing Launcher     %NC%
echo %BOLD%================================%NC%
echo.
goto :eof

:: Function to check Python installation
:check_python
python --version >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo %BOLD%Error: Python is not installed or not in PATH%NC%
    echo Please install Python from https://python.org
    echo Make sure to check "Add Python to PATH" during installation
    pause
    exit /b 1
)
goto :eof

:: Function to check and create virtual environment
:check_venv
if not exist "%SCRIPT_DIR%\venv" (
    echo %BLUE%Creating virtual environment...%NC%
    :: Create venv with error handling
    python -m venv "%SCRIPT_DIR%\venv"
    if %ERRORLEVEL% neq 0 (
        echo %BOLD%Error creating virtual environment%NC%
        pause
        exit /b 1
    )
    
    echo %BLUE%Installing required packages...%NC%
    :: Activate venv and install packages
    call "%SCRIPT_DIR%\venv\Scripts\activate.bat"
    python -m pip install --upgrade pip
    pip install tqdm pathlib requests backoff
    if %ERRORLEVEL% neq 0 (
        echo %BOLD%Error installing required packages%NC%
        pause
        exit /b 1
    )
)
goto :eof

:: Main execution starts here
call :show_header

:: Check Python installation
call :check_python
if %ERRORLEVEL% neq 0 exit /b %ERRORLEVEL%

:: Check and setup virtual environment
call :check_venv
if %ERRORLEVEL% neq 0 exit /b %ERRORLEVEL%

:: Activate virtual environment
call "%SCRIPT_DIR%\venv\Scripts\activate.bat"

:: Display virtual environment information
echo Virtual Environment: %BOLD%%SCRIPT_DIR%\venv%NC%
echo.

:: Get the image folder path from user
echo %BOLD%Please enter the path to your image folder:%NC%
echo Example: C:\Users\username\Pictures
echo %BLUE%(Press Enter to use current directory)%NC%
echo.
set /p "IMAGE_PATH="

:: If no path is provided, use current directory
if "!IMAGE_PATH!"=="" set "IMAGE_PATH=%CD%"

:: Remove quotes if present
set "IMAGE_PATH=!IMAGE_PATH:"=!"

:: Validate the path
if not exist "!IMAGE_PATH!\" (
    echo.
    echo %BOLD%Error: Directory does not exist!%NC%
    echo Please check the path and try again.
    pause
    exit /b 1
)

:: Show confirmation and launch Python script
echo %BLUE%Launching image processor...%NC%
python "%SCRIPT_DIR%\process_images.py" "!IMAGE_PATH!"

:: Keep terminal open if there are errors
echo.
echo %BOLD%Press any key to exit.%NC%
pause >nul

:: Deactivate virtual environment
call "%SCRIPT_DIR%\venv\Scripts\deactivate.bat"

endlocal