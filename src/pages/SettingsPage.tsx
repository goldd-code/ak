import React, { useState } from 'react';
import Layout from '../components/Layout';
import { useSubscriptions } from '../context/SubscriptionContext';
import { Moon, Sun, Upload, Download, Trash2, Settings } from 'lucide-react';

interface SettingsPageProps {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

export default function SettingsPage({ isDarkMode, toggleDarkMode }: SettingsPageProps) {
  const { state, dispatch } = useSubscriptions();
  const [importFile, setImportFile] = useState<File | null>(null);

  const exportData = () => {
    const data = {
      subscriptions: state.subscriptions,
      folders: state.folders,
      sortSettings: {
        option: state.sortOption,
        order: state.sortOrder
      },
      darkMode: isDarkMode
    };
    
    const dataStr = JSON.stringify(data, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `subscription-tracker-export-${new Date().toISOString().slice(0,10)}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    document.body.appendChild(linkElement);
    
    linkElement.click();
    document.body.removeChild(linkElement);
  };

  const importData = async (file: File) => {
    try {
      const text = await file.text();
      const importedData = JSON.parse(text);
      
      if (!importedData.subscriptions || !importedData.folders) {
        throw new Error('Invalid file format');
      }

      if (window.confirm('Importing data will overwrite your current subscriptions and folders. Continue?')) {
        dispatch({ type: 'SET_SUBSCRIPTIONS', payload: importedData.subscriptions });
        dispatch({ type: 'SET_FOLDERS', payload: importedData.folders });
        
        if (importedData.sortSettings) {
          dispatch({ 
            type: 'SET_SORT', 
            payload: importedData.sortSettings 
          });
        }

        alert('Data imported successfully!');
      }
    } catch (error) {
      alert('Failed to import data. Please check the file format.');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImportFile(file);
      importData(file);
    }
  };

  const deleteAllData = () => {
    if (window.confirm('Are you sure you want to delete ALL subscriptions and folders? This action cannot be undone.')) {
      if (window.confirm('This will permanently delete all your data. Are you absolutely sure?')) {
        dispatch({ type: 'SET_SUBSCRIPTIONS', payload: [] });
        dispatch({ type: 'SET_FOLDERS', payload: [] });
        alert('All data has been deleted.');
      }
    }
  };
  return (
    <Layout isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode}>
      <div className="settings-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Settings size={24} fill="currentColor" />
          <h2 className="settings-title">Settings</h2>
        </div>
      </div>

      <div className="content">
        <div className="settings-section">
          <h3 className="settings-section-title">Appearance</h3>
          <div className="setting-item">
            <div className="setting-info">
              <div className="setting-label">Dark Mode</div>
              <div className="setting-description">
                Switch between light and dark themes
              </div>
            </div>
            <button 
              className="setting-toggle"
              onClick={toggleDarkMode}
            >
              {isDarkMode ? <Sun size={20} fill="currentColor" /> : <Moon size={20} fill="currentColor" />}
            </button>
          </div>
        </div>

        <div className="settings-section">
          <h3 className="settings-section-title">Data Management</h3>
          
          <div className="setting-item">
            <div className="setting-info">
              <div className="setting-label">Export Data</div>
              <div className="setting-description">
                Download all your subscriptions and folders as a JSON file
              </div>
            </div>
            <button 
              className="btn btn-primary"
              onClick={exportData}
            >
              <Download size={16} fill="currentColor" />
              Export
            </button>
          </div>

          <div className="setting-item">
            <div className="setting-info">
              <div className="setting-label">Import Data</div>
              <div className="setting-description">
                Upload a previously exported JSON file to restore your data
              </div>
            </div>
            <label className="btn btn-secondary">
              <Upload size={16} fill="currentColor" />
              Import
              <input
                type="file"
                accept=".json"
                style={{ display: 'none' }}
                onChange={handleFileChange}
              />
            </label>
          </div>

          <div className="setting-item">
            <div className="setting-info">
              <div className="setting-label">Delete All Data</div>
              <div className="setting-description">
                Permanently delete all subscriptions and folders
              </div>
            </div>
            <button 
              className="btn btn-danger"
              onClick={deleteAllData}
            >
              <Trash2 size={16} fill="currentColor" />
              Delete All
            </button>
          </div>
        </div>

        <div className="settings-section">
          <h3 className="settings-section-title">Statistics</h3>
          <div className="stats-grid">
            <div className="stat-item-settings">
              <div className="stat-value">{state.subscriptions.filter(s => !s.archived).length}</div>
              <div className="stat-label">Active Subscriptions</div>
            </div>
            <div className="stat-item-settings">
              <div className="stat-value">{state.subscriptions.filter(s => s.archived).length}</div>
              <div className="stat-label">Archived Subscriptions</div>
            </div>
            <div className="stat-item-settings">
              <div className="stat-value">{state.folders.length}</div>
              <div className="stat-label">Folders</div>
            </div>
            <div className="stat-item-settings">
              <div className="stat-value">{new Set(state.subscriptions.map(s => s.tag)).size}</div>
              <div className="stat-label">Unique Tags</div>
            </div>
          </div>
        </div>

        <div className="settings-section">
          <h3 className="settings-section-title">About</h3>
          <div className="about-info">
            <h4>Subscription Tracker</h4>
            <p className="version">Version 2.0.0</p>
            <p>A comprehensive subscription management application</p>
            <p>Track, analyze, and manage all your recurring subscriptions</p>
            <p>Built with React, TypeScript, and modern web technologies</p>
            <p style={{ marginTop: '15px', fontSize: '12px', color: 'var(--text-tertiary)' }}>
              © 2025 Subscription Tracker. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}