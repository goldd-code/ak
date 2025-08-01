import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import AnalyticsPage from './pages/AnalyticsPage';
import ArchivePage from './pages/ArchivePage';
import FolderPage from './pages/FolderPage';
import SettingsPage from './pages/SettingsPage';
import { SubscriptionProvider } from './context/SubscriptionContext';
import './App.css';

function App() {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode');
    const isDark = savedDarkMode === 'true';
    setIsDarkMode(isDark);
    applyDarkMode(isDark);
  }, []);

  const applyDarkMode = (isDark: boolean) => {
    if (isDark) {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  };

  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    localStorage.setItem('darkMode', newMode.toString());
    applyDarkMode(newMode);
  };

  return (
    <SubscriptionProvider>
      <Router>
        <div className="app">
          <Routes>
            <Route path="/" element={<HomePage isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />} />
            <Route path="/analytics" element={<AnalyticsPage isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />} />
            <Route path="/archive" element={<ArchivePage isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />} />
            <Route path="/folder/:id" element={<FolderPage isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />} />
            <Route path="/settings" element={<SettingsPage isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Router>
    </SubscriptionProvider>
  );
}

export default App;