@echo off
echo 🚀 Starting Smart AI Cloud Storage...
echo.

REM Check if .env exists
if not exist "backend\auth_service\.env" (
    echo ⚠️  Warning: .env file not found!
    echo 📝 Creating .env from .env.example...
    copy "backend\auth_service\.env.example" "backend\auth_service\.env"
    echo ✅ Created .env file. Please edit it with your database credentials.
    echo.
)

REM Start Docker Compose
echo 🐳 Starting Docker containers...
docker-compose up --build

echo.
echo ✅ Application started!
echo 🌐 Frontend: http://localhost:5173
echo 🔌 Backend: http://localhost:5000
pause
