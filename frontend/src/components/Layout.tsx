import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { 
  HomeIcon, 
  ArrowsRightLeftIcon, 
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon 
} from '@heroicons/react/24/outline';

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
}

const Layout: React.FC<LayoutProps> = ({ children, title }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <div className="w-64 bg-white shadow-lg">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-gray-800">SecureBank</h1>
          <p className="text-sm text-gray-600 mt-1">Welcome, {user?.firstName}</p>
        </div>
        
        <nav className="mt-6">
          <Link 
            to="/dashboard" 
            className="flex items-center px-6 py-3 text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <HomeIcon className="w-5 h-5 mr-3" />
            Dashboard
          </Link>
          <Link 
            to="/transfer" 
            className="flex items-center px-6 py-3 text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <ArrowsRightLeftIcon className="w-5 h-5 mr-3" />
            Transfer Money
          </Link>
        </nav>

        <div className="absolute bottom-0 w-64 p-6">
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowRightOnRectangleIcon className="w-5 h-5 mr-3" />
            Logout
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <header className="bg-white shadow-sm border-b">
          <div className="px-6 py-4">
            <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
          </div>
        </header>
        
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;