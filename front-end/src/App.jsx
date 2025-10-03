import { useState, useEffect } from 'react'
import Navbar from './components/navbar'
import Dashboard from './components/dashboard'
import LoginPage from './components/loginPage'

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [user, setUser] = useState(null)
  const [tasks, setTasks] = useState([])
  const [isAccountDropdownOpen, setIsAccountDropdownOpen] = useState(false)

  // Check for existing authentication on app load
  useEffect(() => {
    const userData = localStorage.getItem('user')
    
    if (userData) {
      setUser(JSON.parse(userData))
      setIsLoggedIn(true)
    }
  }, [])

  const handleLogin = (userData) => {
    setUser(userData)
    setIsLoggedIn(true)
  }

  const handleLogout = () => {
    localStorage.removeItem('user')
    setUser(null)
    setIsLoggedIn(false)
    setTasks([])
    setIsAccountDropdownOpen(false)
  }

  return (
    <div className="min-h-screen from-slate-50 to-slate-100">
      <Navbar 
        isLoggedIn={isLoggedIn} 
        isAccountDropdownOpen={isAccountDropdownOpen} 
        setIsAccountDropdownOpen={setIsAccountDropdownOpen}
        onLogout={handleLogout}
        user={user}
      />
      <div>
        {!isLoggedIn ? (
            <LoginPage onLogin={handleLogin} />
          ) : (
            <Dashboard 
              tasks={tasks} 
              setTasks={setTasks}
              onLogout={handleLogout}
            />
          )}
      </div>
    </div>
  )
}

export default App
