import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, ChefHat } from 'lucide-react';
import LoginButton from './LoginButton';

const Header = () => {
  const location = useLocation();

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <ChefHat className="h-8 w-8 text-flavor-orange" />
            <span className="font-display text-2xl font-bold text-gray-900">
              Flavor<span className="text-flavor-orange">Share</span>
            </span>
          </Link>

          {/* Right Section */}
          <div className="flex items-center space-x-4">
            <button className="p-2 text-gray-600 hover:text-flavor-orange transition-colors">
              <Search className="h-5 w-5" />
            </button>
            <LoginButton />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
