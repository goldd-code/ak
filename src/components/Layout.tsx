import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Settings, Home, BarChart, Archive } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

export default function Layout({ children, isDarkMode, toggleDarkMode }: LayoutProps) {
  const location = useLocation();

  const navItems = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/analytics', icon: BarChart, label: 'Analytics' },
    { path: '/archive', icon: Archive, label: 'Archive' }
  ];

  return (
    <div className="container">
      <div className="header">
        <div className="header-top">
          <h1>
           <Home size={20} /> My Subscriptions
          </h1>
          <Link to="/settings" className={`settings-toggle ${location.pathname === '/settings' ? 'active' : ''}`}>
           <Settings size={16} />
          </Link>
        </div>
        
        <div className="nav-bar">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-btn ${location.pathname === item.path ? 'active' : ''}`}
            >
              <item.icon size={14} /> {item.label}
            </Link>
          ))}
        </div>
      </div>

      {children}
    </div>
  );
}