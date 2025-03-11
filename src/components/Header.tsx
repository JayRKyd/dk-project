import React, { useState } from 'react';
import { User, Menu, X } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

export default function Header() {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

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

          {/* Login and Language Selection */}
          <div className="hidden md:flex items-center space-x-2">
            <Link to="/login" className="flex items-center space-x-1 hover:text-pink-200">
              <User className="h-5 w-5" />
              <span>Login</span>
            </Link>
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
              <div className="pt-2 border-t border-pink-400">
                <Link
                  to="/login"
                  className="flex items-center space-x-1 hover:text-pink-200"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <User className="h-5 w-5" />
                  <span>Login</span>
                </Link>
              </div>
              <div className="flex space-x-4 pt-2">
                <img src="https://flagcdn.com/w20/nl.png" alt="Dutch" className="w-5 h-5" />
                <img src="https://flagcdn.com/w20/gb.png" alt="English" className="w-5 h-5" />
                <img src="https://flagcdn.com/w20/ro.png" alt="Romanian" className="w-5 h-5" />
              </div>
            </nav>
          </div>
        </div>
      </div>
    </header>
  );
}