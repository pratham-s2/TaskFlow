# Task Manager

A full-stack task management app with user authentication, built with React, Node.js, Express, and MongoDB.

Deployed on EC2 using Docker at: http://taskflowapp.org

## Features

- User authentication (JWT + bcrypt)
- CRUD operations for tasks
- Task status tracking (To Do, In Progress, Done)
- Search, filter, and pagination
- Responsive design with Tailwind CSS

## Tech Stack

- **Frontend**: React + Vite + Tailwind CSS
- **Backend**: Node.js + Express + MongoDB
- **Auth**: JWT with httpOnly cookies
- **Deployment**: Docker + Nginx + AWS EC2

## Local Startup

### 1. Clone & Setup
```bash
git clone https://github.com/pratham-s2/TaskFlow
cd ./TaskFlow
```

### 2. MongoDB Atlas
1. Create free account at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create cluster and get connection string
3. Whitelist IP (or use 0.0.0.0/0 for dev)

### 3. Environment Variables

**Backend** (`back-end/.env`):
## Generate JWT Secret
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```
```env
MONGO_URL=mongodb+srv://username:password@cluster.mongodb.net/taskmanager?retryWrites=true&w=majority
JWT_SECRET=your-secret-jwt-key-here
PORT=3000
```

For local development, alter the CORS setup in server.js to allow origin from your front-end localhost URL

**Frontend** (`front-end/.env`):
```env
VITE_API_BASE_URL='/api'
```

### 4. Run

**With Docker:**
Install Docker: https://docs.docker.com/engine/install/
```bash
docker-compose up --build
# Access: http://localhost to view app
```
