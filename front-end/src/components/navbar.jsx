import { useState, useEffect, useRef } from 'react'

export default function Navbar({isLoggedIn, isAccountDropdownOpen, setIsAccountDropdownOpen, onLogout}) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [loading, setLoading] = useState(false)
  const accountDropdownRef = useRef(null)

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  const toggleAccountDropdown = () => {
    setIsAccountDropdownOpen(!isAccountDropdownOpen)
  }

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (accountDropdownRef.current && !accountDropdownRef.current.contains(event.target)) {
        setIsAccountDropdownOpen(false)
      }
    }

    if (isAccountDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isAccountDropdownOpen])

  const handleDeleteAccount = () => {
    setShowDeleteModal(true)
    setIsAccountDropdownOpen(false)
  }

  const confirmDeleteAccount = async () => {
    try {
      setLoading(true)
      
      // Delete user account
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/delete-account`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      })

      const data = await response.json()
      
      if (data.success) {
        // Clear local storage and logout
        localStorage.removeItem('user')
        onLogout()
        setShowDeleteModal(false)
      } else {
        alert(data.message || 'Failed to delete account')
      }
    } catch (error) {
      console.error('Error deleting account:', error)
      alert('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      // Call logout endpoint to clear cookie
      await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/logout`, {
        method: 'POST',
        credentials: 'include'
      })
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      // Clear local storage and logout
      localStorage.removeItem('user')
      onLogout()
      setIsAccountDropdownOpen(false)
    }
  }

  return (
    <>
      <nav className='bg-white shadow-sm'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='flex justify-between items-center h-16'>
            {/* Logo */}
            <button className='flex items-center gap-2'>
              <img src="/logo.svg" alt="task logo" className='h-8 w-8' />
              <h1 className='text-black hover:text-gray-800 font-bold text-xl'>TaskFlow</h1>
            </button>

            {/* Desktop Menu */}
            <div className='hidden md:flex items-center gap-6'>
              {isLoggedIn && (
                <div className='relative' ref={accountDropdownRef}>
                  <button 
                    onClick={toggleAccountDropdown}
                    className='flex items-center gap-1 text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium'
                  >
                    Account
                    <svg className={`w-4 h-4 transition-transform ${isAccountDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  
                  {isAccountDropdownOpen && (
                    <div className='absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border'>
                      <button
                        onClick={handleDeleteAccount}
                        className='block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50'
                      >
                        Delete Account
                      </button>
                    </div>
                  )}
                </div>
              )}
              <button 
                onClick={isLoggedIn ? handleLogout : undefined}
                className='bg-black hover:bg-gray-900 text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors'
              >
                {isLoggedIn ? "Log Out" : "Log In"}
              </button>
            </div>

            {/* Mobile menu button */}
            <div className='md:hidden'>
              <button
                onClick={toggleMobileMenu}
                className='text-gray-700 hover:text-gray-900 p-2'
              >
                <svg className='h-6 w-6' fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {isMobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className='md:hidden border-t border-gray-200'>
              <div className='px-2 pt-2 pb-3 space-y-1'>
                {isLoggedIn && (
                  <div className='space-y-1'>
                    <button 
                      onClick={toggleAccountDropdown}
                      className='flex items-center justify-between w-full text-left px-3 py-2 text-gray-700 hover:text-gray-900 rounded-md text-base font-medium'
                    >
                      Account
                      <svg className={`w-4 h-4 transition-transform ${isAccountDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    {isAccountDropdownOpen && (
                      <div className='pl-4 space-y-1'>
                        <button
                          onClick={handleDeleteAccount}
                          className='block w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md'
                        >
                          Delete Account
                        </button>
                      </div>
                    )}
                  </div>
                )}
                <button 
                  onClick={isLoggedIn ? handleLogout : undefined}
                  className='w-full text-left bg-black hover:bg-gray-900 text-white rounded-lg px-3 py-2 text-base font-medium'
                >
                  {isLoggedIn ? "Log Out" : "Log In"}
                </button>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
          <div className='bg-white rounded-lg p-6 max-w-md w-full mx-4'>
            <h3 className='text-lg font-semibold text-gray-900 mb-4'>Delete Account</h3>
            <p className='text-gray-600 mb-6'>
              Are you sure you want to delete your account? This will permanently delete:
            </p>
            <ul className='text-sm text-gray-600 mb-6 list-disc list-inside'>
              <li>Your account and profile</li>
              <li>All your tasks and data</li>
              <li>This action cannot be undone</li>
            </ul>
            <div className='flex gap-3 justify-end'>
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={loading}
                className='px-4 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 rounded-md text-sm font-medium transition-colors'
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteAccount}
                disabled={loading}
                className='px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white rounded-md text-sm font-medium transition-colors'
              >
                {loading ? 'Deleting...' : 'Delete Account'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}