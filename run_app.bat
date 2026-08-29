@echo off
setlocal EnableExtensions

set "ROOT=%~dp0"
set "BACKEND_DIR=%ROOT%backend"
set "FRONTEND_DIR=%ROOT%frontend"
set "BACKEND_PORT=8000"
set "FRONTEND_PORT=5174"

cd /d "%ROOT%"

:: Determine Python executable
set "PY_CMD="
if exist "%ROOT%.venv\Scripts\python.exe" (
    set "PY_CMD=%ROOT%.venv\Scripts\python.exe"
) else (
    where /q py
    if %errorlevel% equ 0 (
        set "PY_CMD=py"
    ) else (
        where /q python
        if %errorlevel% equ 0 (
            set "PY_CMD=python"
        ) else if exist "%LOCALAPPDATA%\Programs\Python\Python312\python.exe" (
            set "PY_CMD=%LOCALAPPDATA%\Programs\Python\Python312\python.exe"
        ) else if exist "%LOCALAPPDATA%\Programs\Python\Python313\python.exe" (
            set "PY_CMD=%LOCALAPPDATA%\Programs\Python\Python313\python.exe"
        )
    )
)
if "%PY_CMD%"=="" (
    echo [ERROR] Python executable not found! Please install Python or set up .venv.
    pause
    exit /b 1
)

:: Install frontend dependencies if needed
if not exist "%FRONTEND_DIR%\node_modules" (
    echo Installing frontend dependencies...
    cd /d "%FRONTEND_DIR%"
    call npm install
    cd /d "%ROOT%"
)

:: Ensure ML models are trained
if not exist "%BACKEND_DIR%\model\model.joblib" (
    echo Training machine learning models...
    cd /d "%BACKEND_DIR%"
    "%PY_CMD%" generate_data.py
    "%PY_CMD%" train.py
    "%PY_CMD%" train_image_model.py
    cd /d "%ROOT%"
)

:: Release ports if currently occupied
for /f "tokens=5" %%P in ('netstat -ano ^| findstr /R /C":%BACKEND_PORT% .*LISTENING" 2^>nul') do (
    echo Releasing occupied backend port %BACKEND_PORT% (PID %%P)
    taskkill /PID %%P /F >nul 2>&1
)

for /f "tokens=5" %%P in ('netstat -ano ^| findstr /R /C":%FRONTEND_PORT% .*LISTENING" 2^>nul') do (
    echo Releasing occupied frontend port %FRONTEND_PORT% (PID %%P)
    taskkill /PID %%P /F >nul 2>&1
)

echo Starting Backend Service (FastAPI on port %BACKEND_PORT%)...
start "Backend" /D "%BACKEND_DIR%" cmd /k ""%PY_CMD%" -m uvicorn index:app --host 0.0.0.0 --port %BACKEND_PORT% --reload"

echo Starting Frontend Service (Vite on port %FRONTEND_PORT%)...
start "Frontend" /D "%FRONTEND_DIR%" cmd /k "npm.cmd run dev -- --host 0.0.0.0 --port %FRONTEND_PORT%"

echo.
echo ==========================================================
echo AI-Powered Disease Prediction System is running!
echo Backend Docs:  http://localhost:%BACKEND_PORT%/docs
echo Frontend App:  http://localhost:%FRONTEND_PORT%
echo ==========================================================
echo.

start "" http://localhost:%FRONTEND_PORT%

exit /b 0
