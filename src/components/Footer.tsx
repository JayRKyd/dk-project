import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Shield, Mail, HelpCircle } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-pink-500 text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <h3 className="font-bold text-lg mb-4">DateKelly</h3>
            <p className="text-pink-100 text-sm">
              The leading platform for adult services in the Netherlands. Find and connect with verified escorts, clubs, and agencies.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-bold text-lg mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-pink-100 hover:text-white transition-colors">
                  Ladies
                </Link>
              </li>
              <li>
                <Link to="/search" className="text-pink-100 hover:text-white transition-colors">
                  Search
                </Link>
              </li>
              <li>
                <Link 
                  to="/clubs" 
                  className="text-pink-100 hover:text-white transition-colors"
                >
                  Clubs & Agencies
                </Link>
              </li>
              <li>
                <Link to="/reviews" className="text-pink-100 hover:text-white transition-colors">
                  Reviews
                </Link>
              </li>
              <li>
                <Link to="/fan-posts" className="text-pink-100 hover:text-white transition-colors">
                  Fan Posts
                </Link>
              </li>
            </ul>
          </div>

          {/* Dashboards */}
          <div>
            <h3 className="font-bold text-lg mb-4">Dashboards</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/dashboard/lady" className="text-pink-100 hover:text-white transition-colors">
                  PRO/ULTRA Dashboard
                </Link>
              </li>
              <li>
                <Link to="/dashboard/lady/free" className="text-pink-100 hover:text-white transition-colors">
                  FREE Dashboard
                </Link>
              </li>
              <li>
                <Link to="/dashboard/club" className="text-pink-100 hover:text-white transition-colors">
                  Clubs Dashboard
                </Link>
              </li>
              <li>
                <Link to="/dashboard/client" className="text-pink-100 hover:text-white transition-colors">
                  Client Dashboard
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-bold text-lg mb-4">Support</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/faq" className="text-pink-100 hover:text-white transition-colors flex items-center gap-2">
                  <HelpCircle className="h-4 w-4" />
                  <span>FAQ</span>
                </Link>
              </li>
              <li>
                <Link to="/support" className="text-pink-100 hover:text-white transition-colors flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  <span>Support</span>
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-pink-100 hover:text-white transition-colors flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  <span>Contact</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Languages */}
          <div>
            <h3 className="font-bold text-lg mb-4">Languages</h3>
            <div className="flex flex-wrap gap-4">
              <button className="flex items-center gap-2">
                <img src="https://flagcdn.com/w20/nl.png" alt="Dutch" className="w-5 h-5" />
                <span className="text-pink-100 hover:text-white transition-colors">Dutch</span>
              </button>
              <button className="flex items-center gap-2">
                <img src="https://flagcdn.com/w20/gb.png" alt="English" className="w-5 h-5" />
                <span className="text-pink-100 hover:text-white transition-colors">English</span>
              </button>
              <button className="flex items-center gap-2">
                <img src="https://flagcdn.com/w20/ro.png" alt="Romanian" className="w-5 h-5" />
                <span className="text-pink-100 hover:text-white transition-colors">Romanian</span>
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="py-6 border-t border-pink-400 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-pink-100 text-sm">
            © {new Date().getFullYear()} DateKelly. All rights reserved.
          </div>
          <div className="flex items-center gap-6">
            <Link to="/terms" className="text-pink-100 hover:text-white text-sm transition-colors">
              Terms of Service
            </Link>
            <Link to="/privacy" className="text-pink-100 hover:text-white text-sm transition-colors">
              Privacy Policy
            </Link>
            <Link to="/cookies" className="text-pink-100 hover:text-white text-sm transition-colors">
              Cookie Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}