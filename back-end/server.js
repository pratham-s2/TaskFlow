const express = require("express")
const app = express()
const mongoose = require("mongoose")
const dotenv = require('dotenv').config()
const cors = require('cors')
const cookieParser = require('cookie-parser')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')

const MONGO_URL = process.env.MONGO_URL
const JWT_SECRET = process.env.JWT_SECRET
const port = process.env.PORT || 3000

app.use(express.json())
app.use(cookieParser())
app.use(cors({
  credentials: true, 
  origin: ['http://taskflowapp.org', 'http://www.taskflowapp.org']
}))

async function connectDB() {
  try {
  await mongoose.connect(MONGO_URL);
  console.log("MongoDB connected");
  const conn = mongoose.connection;
    console.log("Database name:", conn.name)
  console.log("Connection readyState:", conn.readyState);
  } catch (error) {
    console.error("Database connection error:", error);
    process.exit(1);
  }
}
// Task Schema
const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  status: {
    type: String,
    enum: ['To Do', 'In Progress', 'Done'],
    default: 'To Do'
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
})

//User Schema
const userSchema = new mongoose.Schema({
email: {type:String, required: [true, 'Email is required'], trim: true, maxlength: [254, 'Email cannot exceed 100 characters']},
password: {type:String, required:[true, 'Password is required'], trim: true, maxlength: [100, 'Password cannot exceed 100 characters']}, // CHANGE LENGTH
joinedAt: {type:Date, default: Date.now}
})

const Task = mongoose.model("Task", taskSchema)
const User = mongoose.model("User", userSchema)

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const token = req.cookies.token

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access token required'
    })
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({
        success: false,
        message: 'Invalid or expired token'
      })
    }
    req.user = user
    next()
  })
}


//ROUTES
// Authentication Routes
// POST /auth/register - Register new user
app.post('/auth/register', async (req, res) => {
  try {
    const { email, password } = req.body

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      })
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create user
    const user = new User({
      email,
      password: hashedPassword
    })

    await user.save()

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    )

    // Set httpOnly cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    })

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: {
        user: { id: user._id, email: user.email }
      }
    })
  } catch (error) {
    console.error('Registration error:', error)
    res.status(500).json({
      success: false,
      message: 'Error creating user',
      error: error.message
    })
  }
})

// POST /auth/login - Login user
app.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      })
    }

    // Find user
    const user = await User.findOne({ email })
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      })
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password)
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      })
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    )

    // Set httpOnly cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    })

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: { id: user._id, email: user.email }
      }
    })
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({
      success: false,
      message: 'Error during login',
      error: error.message
    })
  }
})

// POST /auth/logout - Logout user
app.post('/auth/logout', (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax'
  })
  
  res.status(200).json({
    success: true,
    message: 'Logout successful'
  })
})

// DELETE /auth/delete-account - Delete user account and all their tasks
app.delete('/auth/delete-account', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId

    // Delete all tasks belonging to the user
    await Task.deleteMany({ user: userId })

    // Delete the user account
    await User.findByIdAndDelete(userId)

    res.status(200).json({
      success: true,
      message: 'Account and all associated data deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting account:', error)
    res.status(500).json({
      success: false,
      message: 'Error deleting account',
      error: error.message
    })
  }
})

// Task Routes (Protected)
// GET /tasks - Retrieve all tasks for authenticated user
app.get('/tasks', authenticateToken, async (req, res) => {
  try {
    const tasks = await Task.find({ user: req.user.userId }).sort({ createdAt: -1 })
    res.status(200).json({
      success: true,
      count: tasks.length,
      data: tasks
    })
  } catch (error) {
    console.error('Error fetching tasks:', error)
    res.status(500).json({
      success: false,
      message: 'Error fetching tasks',
      error: error.message
    })
  }
})

// GET /tasks/:id - Retrieve a task by ID
app.get('/tasks/:id', authenticateToken, async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, user: req.user.userId })
    
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      })
    }
    
    res.status(200).json({
      success: true,
      data: task
    })
  } catch (error) {
    console.error('Error fetching task:', error)
    res.status(500).json({
      success: false,
      message: 'Error fetching task',
      error: error.message
    })
  }
})

// POST /tasks - Create a new task
app.post('/tasks', authenticateToken, async (req, res) => {
  try {
    const { title, description, status } = req.body
    
    // Validation
    if (!title || title.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Title is required'
      })
    }
    
    const taskData = {
      title: title.trim(),
      description: description ? description.trim() : '',
      status: status || 'To Do',
      user: req.user.userId
    }
    
    const task = new Task(taskData)
    const savedTask = await task.save()
    
    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      data: savedTask
    })
  } catch (error) {
    console.error('Error creating task:', error)
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: Object.values(error.errors).map(err => err.message)
      })
    }
    
    res.status(500).json({
      success: false,
      message: 'Error creating task',
      error: error.message
    })
  }
})

// PUT /tasks/:id - Update a task by ID
app.put('/tasks/:id', authenticateToken, async (req, res) => {
  try {
    const { title, description, status } = req.body
    
    // Validation
    if (title !== undefined && (!title || title.trim() === '')) {
      return res.status(400).json({
        success: false,
        message: 'Title cannot be empty'
      })
    }
    
    if (status && !['To Do', 'In Progress', 'Done'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status must be one of: To Do, In Progress, Done'
      })
    }
    
    const updateData = {}
    if (title !== undefined) updateData.title = title.trim()
    if (description !== undefined) updateData.description = description.trim()
    if (status !== undefined) updateData.status = status
    
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, user: req.user.userId },
      updateData,
      { new: true, runValidators: true }
    )
    
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      })
    }
    
    res.status(200).json({
      success: true,
      message: 'Task updated successfully',
      data: task
    })
  } catch (error) {
    console.error('Error updating task:', error)
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: Object.values(error.errors).map(err => err.message)
      })
    }
    
    res.status(500).json({
      success: false,
      message: 'Error updating task',
      error: error.message
    })
  }
})

// DELETE /tasks/:id - Delete a task by ID
app.delete('/tasks/:id', authenticateToken, async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, user: req.user.userId })
    
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      })
    }
    
    res.status(200).json({
      success: true,
      message: 'Task deleted successfully',
      data: task
    })
    } catch (error) {
    console.error('Error deleting task:', error)
    res.status(500).json({
      success: false,
      message: 'Error deleting task',
      error: error.message
    })
  }
})

// Health check
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Task Management API is running',
    version: '1.0.0'
  })
})

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error)
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: "Something Went Wrong"
  })
})

// Start server
connectDB().then(() => {
  app.listen(port, () => {console.log(`Server is running on port ${port}`)})})
  .catch((error) => {
    console.error('Failed to start server:', error)
    process.exit(1)
})