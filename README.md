# Task Manager

A full-stack task management app with user authentication, built with React, Node.js, Express, and MongoDB (Atlas).

Deployed on EC2 using Docker at: http://taskflowapp.org

# About the development process:

I started out by initializing the project and connecting the front end, back end, and MongoDB database together. 
My technology choices came down to comfort. I am most comfortable with react/vite/tailwind for the front end and express.js on the back end. I used MongoDB as suggested; MongoDB works great for this type of app due to its speed and ease of querying. SQL-like structure and consistency was not necessary for this app. 
AI was used to speed up the development process, although it was not used for simply building the whole app; it was used to remove redundant development.
I started with designing the database schemas; I knew I was using user-based auth from the start, so I had to account for this in the DB design.
I then built all the CRUD routes and tested them using CURL.
Lastly, I built the front end and made it responsive using tailwind.

Deploying the project was quick and easy. I created two Docker files (for the front and back), configured CORS and nginx, and created the docker-compose file. The database was online (Atlas), so the setup for that remained the same. I launched an EC2 instance, installed Docker on it, and pulled the code from the public repository.
Lastly, I bought a domain for the app from Cloudflare and pointed it to the EC2 Elastic IP.

A major point of improvement is configuring https on the online deployment. Currently, only http is configured which is unsafe, especially when using passwords and emails. I also would have liked to spend more time personalizing the CSS to how I would like it; time did not allow for this.

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
