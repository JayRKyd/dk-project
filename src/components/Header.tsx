import React, { useState, useEffect, useRef } from 'react';
import { User, Menu, X, LogOut, Settings, UserCircle, ChevronDown } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getUserDisplayName, getUserDisplayNameAsync, getUserRole } from '../utils/authUtils';

export default function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [displayName, setDisplayName] = useState<string>('');
  const [isLoadingName, setIsLoadingName] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleUserMenu = () => {
    setIsUserMenuOpen(!isUserMenuOpen);
  };

  const getDashboardUrl = () => {
    const userRole = getUserRole(user);
    switch (userRole) {
      case 'lady':
        return '/dashboard/lady';
      case 'client':
        return '/dashboard/client';
      case 'club':
        return '/dashboard/club';
      case 'admin':
        return '/admin';
      default:
        return '/dashboard';
    }
  };

  // Fetch user display name on component mount and user change
  useEffect(() => {
    const fetchDisplayName = async () => {
      if (user) {
        setIsLoadingName(true);
        try {
          // Start with synchronous name for immediate display
          const syncName = getUserDisplayName(user);
          setDisplayName(syncName);
          
          // Then fetch async name for better accuracy
          const asyncName = await getUserDisplayNameAsync(user);
          if (asyncName !== syncName) {
            setDisplayName(asyncName);
          }
        } catch (error) {
          console.warn('Error fetching display name:', error);
          // Fallback to sync name
          setDisplayName(getUserDisplayName(user));
        } finally {
          setIsLoadingName(false);
        }
      } else {
        setDisplayName('');
        setIsLoadingName(false);
      }
    };

    fetchDisplayName();
  }, [user]);

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };

    if (isUserMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isUserMenuOpen]);

  return (
    <header className="bg-pink-500 text-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between">
          <img 
            src="https://raw.githubusercontent.com/stackblitz/stackblitz-images/main/datekelly-com-logo.png" 
            alt="dateKelly.com" 
            className="h-8"
          />
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8 absolute left-1/2 transform -translate-x-1/2">
            <Link
              to="/"
              className={`flex items-center space-x-1 hover:text-pink-200 ${
                location.pathname === '/' ? 'text-pink-200' : ''
              }`}
            >
              <span>Ladies</span>
            </Link>
            <Link
              to="/search"
              className={`flex items-center space-x-1 hover:text-pink-200 ${
                location.pathname === '/search' ? 'text-pink-200' : ''
              }`}
            >
              <span>Search</span>
            </Link>
            <Link
              to="/clubs"
              className={`flex items-center space-x-1 hover:text-pink-200 ${
                location.pathname.startsWith('/clubs') ? 'text-pink-200' : ''
              }`}
            >
              <span>Clubs & Agencies</span>
            </Link>
            <Link
              to="/reviews"
              className={`flex items-center space-x-1 hover:text-pink-200 ${
                location.pathname === '/reviews' ? 'text-pink-200' : ''
              }`}
            >
              <span>Reviews</span>
            </Link>
            <Link
              to="/fan-posts"
              className={`flex items-center space-x-1 hover:text-pink-200 ${
                location.pathname === '/fan-posts' ? 'text-pink-200' : ''
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              <span>Fan Posts</span>
            </Link>
          </nav>

          {/* User Account Menu and Language Selection */}
          <div className="hidden md:flex items-center space-x-2">
            {user ? (
              <div className="relative" ref={userMenuRef}>
                <button 
                  onClick={toggleUserMenu}
                  className="flex items-center space-x-2 hover:text-pink-200 bg-pink-600 px-3 py-2 rounded-lg transition-colors"
                >
                  <UserCircle className="h-5 w-5" />
                  <span className="max-w-32 truncate">
                    {isLoadingName ? (
                      <span className="animate-pulse">Loading...</span>
                    ) : (
                      displayName || getUserDisplayName(user)
                    )}
                  </span>
                  <ChevronDown className="h-4 w-4" />
                </button>
                
                {/* User Dropdown Menu */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                    <div className="py-2">
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-900">
                          {displayName || getUserDisplayName(user)}
                        </p>
                        <p className="text-xs text-gray-500 capitalize">{getUserRole(user)} Account</p>
                        {user.email && (
                          <p className="text-xs text-gray-400 truncate mt-1">{user.email}</p>
                        )}
                      </div>
                      
                      <Link 
                        to={getDashboardUrl()}
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <UserCircle className="h-4 w-4 mr-2" />
                        Dashboard
                      </Link>
                      
                      <Link 
                        to="/dashboard/settings"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <Settings className="h-4 w-4 mr-2" />
                        Account Settings
                      </Link>
                      
                      <div className="border-t border-gray-100 mt-2 pt-2">
                        <button 
                          onClick={async () => {
                            await signOut();
                            setIsUserMenuOpen(false);
                            navigate('/');
                          }} 
                          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          <LogOut className="h-4 w-4 mr-2" />
                          Logout
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login" className="flex items-center space-x-1 hover:text-pink-200">
                <User className="h-5 w-5" />
                <span>Login</span>
              </Link>
            )}
            <div className="flex space-x-2 ml-4">
              <img src="https://flagcdn.com/w20/nl.png" alt="Dutch" className="w-5 h-5" />
              <img src="https://flagcdn.com/w20/gb.png" alt="English" className="w-5 h-5" />
              <img src="https://flagcdn.com/w20/ro.png" alt="Romanian" className="w-5 h-5" />
            </div>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={toggleMenu}
            className="md:hidden p-2 rounded-lg hover:bg-pink-600 transition-colors"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>

          {/* Mobile Navigation */}
          <div
            className={`md:hidden absolute top-full left-0 right-0 bg-pink-500 shadow-lg transition-all duration-300 ease-in-out ${
              isMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
            }`}
          >
            <nav className="flex flex-col py-4 px-4 space-y-4">
              <Link
                to="/"
                className={`flex items-center space-x-1 hover:text-pink-200 ${
                  location.pathname === '/' ? 'text-pink-200' : ''
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                <span>Ladies</span>
              </Link>
              <Link
                to="/search"
                className={`flex items-center space-x-1 hover:text-pink-200 ${
                  location.pathname === '/search' ? 'text-pink-200' : ''
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                <span>Search</span>
              </Link>
              <Link
                to="/clubs"
                className={`flex items-center space-x-1 hover:text-pink-200 ${
                  location.pathname.startsWith('/clubs') ? 'text-pink-200' : ''
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                <span>Clubs & Agencies</span>
              </Link>
              <Link
                to="/reviews"
                className={`flex items-center space-x-1 hover:text-pink-200 ${
                  location.pathname === '/reviews' ? 'text-pink-200' : ''
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                <span>Reviews</span>
              </Link>
              <Link
                to="/fan-posts"
                className={`flex items-center space-x-1 hover:text-pink-200 ${
                  location.pathname === '/fan-posts' ? 'text-pink-200' : ''
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                <span>Fan Posts</span>
              </Link>
              
              {/* Mobile User Menu */}
              {user ? (
                <div className="border-t border-pink-400 pt-4 mt-4">
                  <div className="mb-3">
                    <p className="text-sm font-medium">
                      {displayName || getUserDisplayName(user)}
                    </p>
                    <p className="text-xs text-pink-200 capitalize">{getUserRole(user)} Account</p>
                    {user.email && (
                      <p className="text-xs text-pink-300 truncate mt-1">{user.email}</p>
                    )}
                  </div>
                  
                  <Link 
                    to={getDashboardUrl()}
                    className="flex items-center space-x-2 hover:text-pink-200 py-2"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <UserCircle className="h-4 w-4" />
                    <span>Dashboard</span>
                  </Link>
                  
                  <Link 
                    to="/dashboard/settings"
                    className="flex items-center space-x-2 hover:text-pink-200 py-2"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Settings className="h-4 w-4" />
                    <span>Account Settings</span>
                  </Link>
                  
                  <button 
                    onClick={async () => {
                      await signOut();
                      setIsMenuOpen(false);
                      navigate('/');
                    }} 
                    className="flex items-center space-x-2 hover:text-pink-200 py-2"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Logout</span>
                  </button>
                </div>
              ) : (
                <div className="border-t border-pink-400 pt-4 mt-4">
                  <Link 
                    to="/login" 
                    className="flex items-center space-x-1 hover:text-pink-200"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <User className="h-5 w-5" />
                    <span>Login</span>
                  </Link>
                </div>
              )}
            </nav>
          </div>
        </div>
      </div>
    </header>
  );
}