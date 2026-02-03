@echo off
echo 🧠 Starting AI Service Setup...
cd ai_service

echo 📦 Installing dependencies (Torch, Transformers)... 
echo This might take a few minutes on the first run.
pip install -r requirements.txt

echo.
echo 🚀 Launching AI Engine...
python main.py
pause
