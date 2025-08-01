import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Settings, Home, BarChart3, Archive } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

export default function Layout({ children, isDarkMode, toggleDarkMode }: LayoutProps) {
  const location = useLocation();

  const navItems = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/analytics', icon: BarChart3, label: 'Analytics' },
    { path: '/archive', icon: Archive, label: 'Archive' }
  ];

  return (
    <div className="container">
      <div className="header">
        <div className="header-top">
          <h1>
            <Home size={24} fill="currentColor" /> My Subscriptions
          </h1>
          <Link to="/settings" className={`settings-toggle ${location.pathname === '/settings' ? 'active' : ''}`}>
            <Settings size={18} fill={location.pathname === '/settings' ? 'currentColor' : 'none'} />
          </Link>
        </div>
        
        <div className="nav-bar">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-btn ${location.pathname === item.path ? 'active' : ''}`}
            >
              <item.icon size={16} fill={location.pathname === item.path ? 'currentColor' : 'none'} /> {item.label}
            </Link>
          ))}
        </div>
      </div>

      {children}
    </div>
  );
}