# Smart AI Cloud Storage

A modern cloud storage application with authentication, built with React and Node.js.

## 🚀 Quick Start with Docker

### Prerequisites
- Docker
- Docker Compose

### Run the Application

1. Clone the repository:
```bash
git clone <your-repo-url>
cd smart_ai_cloud_storage
```

2. Create a `.env` file in `backend/auth_service/` with your database credentials:
```env
DATABASE_URL="your-direct-database-url"
DATABASE_URL_ACCELERATE="your-accelerate-url"
JWT_SECRET="your-secret-key"
PORT=5000
```

3. Start the application:
```bash
docker-compose up
```

That's it! The application will be available at:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000

### Stop the Application
```bash
docker-compose down
```

## 🛠️ Manual Setup (Without Docker)

### Backend Setup
```bash
cd backend/auth_service
npm install
npx prisma generate
npm run dev
```

### Frontend Setup
```bash
cd frontend/my-react-app
npm install
npm run dev
```

## 📁 Project Structure

```
smart_ai_cloud_storage/
├── backend/
│   └── auth_service/          # Authentication service
│       ├── src/
│       ├── prisma/
│       ├── Dockerfile
│       └── package.json
├── frontend/
│   └── my-react-app/          # React frontend
│       ├── src/
│       ├── public/
│       ├── Dockerfile
│       └── package.json
└── docker-compose.yml         # Docker orchestration
```

## ✨ Features

- 🔐 User Authentication (Login/Signup)
- 📸 Photo Gallery Interface
- 🎨 Modern UI with Glassmorphism
- 🌐 RESTful API
- 🐳 Docker Support
- 🔄 Hot Reload in Development

## 🔧 Tech Stack

**Frontend:**
- React 19
- Vite
- React Router
- Axios

**Backend:**
- Node.js
- Express
- Prisma ORM
- PostgreSQL (Neon)
- JWT Authentication

## 📝 Environment Variables

Create a `.env` file in `backend/auth_service/`:

```env
DATABASE_URL="postgresql://..."
DATABASE_URL_ACCELERATE="prisma+postgres://..."
JWT_SECRET="your-secret-key"
PORT=5000
```

## 🎯 Demo Credentials

Use these placeholder credentials as a guide:
- Email: demo@example.com
- Password: demo123

## 📄 License

MIT
