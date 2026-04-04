@echo off
echo Starting Backend...
cd /d "%~dp0be"
call venv\Scripts\activate.bat
python run.py
pause
