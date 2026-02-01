#!/bin/bash

echo "🚀 Starting Smart AI Cloud Storage..."
echo ""

# Check if .env exists
if [ ! -f "./backend/auth_service/.env" ]; then
    echo "⚠️  Warning: .env file not found!"
    echo "📝 Creating .env from .env.example..."
    cp ./backend/auth_service/.env.example ./backend/auth_service/.env
    echo "✅ Created .env file. Please edit it with your database credentials."
    echo ""
fi

# Start Docker Compose
echo "🐳 Starting Docker containers..."
docker-compose up --build

echo ""
echo "✅ Application started!"
echo "🌐 Frontend: http://localhost:5173"
echo "🔌 Backend: http://localhost:5000"
