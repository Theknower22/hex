@echo off
cd /d %~dp0
echo Activating virtual environment...
if not exist venv (
    echo [ERROR] Virtual environment not found. Please run: python -m venv venv
    pause
    exit /b
)
call venv\Scripts\activate
echo Installing/Verifying dependencies...
pip install -r requirements.txt
echo Starting FastAPI server...
python -m uvicorn main:app --reload --port 8000
pause
