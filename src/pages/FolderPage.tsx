import React, { useState } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import Layout from '../components/Layout';
import SubscriptionCard from '../components/SubscriptionCard';
import SubscriptionForm from '../components/SubscriptionForm';
import { useSubscriptions } from '../context/SubscriptionContext';
import { Search, Filter, ArrowUpDown, Plus, Edit, Trash } from 'lucide-react';
import { getCountdownInfo } from '../utils/dateUtils';

interface FolderPageProps {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

export default function FolderPage({ isDarkMode, toggleDarkMode }: FolderPageProps) {
  const { id } = useParams<{ id: string }>();
  const { state, dispatch } = useSubscriptions();
  const [searchTerm, setSearchTerm] = useState('');
  const [showSubscriptionForm, setShowSubscriptionForm] = useState(false);
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [sortOption, setSortOption] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', icon: '' });

  const folder = state.folders.find(f => f.id === id);
  
  if (!folder) {
    return <Navigate to="/" replace />;
  }

  const folderSubscriptions = state.subscriptions.filter(sub => 
    sub.folderId === id && !sub.archived
  );

  let filteredSubscriptions = folderSubscriptions.filter(sub => {
    const matchesSearch = sub.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         sub.tag.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTags = selectedTags.length === 0 || selectedTags.includes(sub.tag);
    return matchesSearch && matchesTags;
  });

  // Apply sorting
  if (sortOption) {
    filteredSubscriptions.sort((a, b) => {
      let comparison = 0;
      
      switch (sortOption) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'amount':
          comparison = a.amount - b.amount;
          break;
        case 'date':
          comparison = new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
          break;
        case 'tag':
          comparison = a.tag.localeCompare(b.tag);
          break;
        default:
          return 0;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }

  const allTags = [...new Set(folderSubscriptions.map(sub => sub.tag))];

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const handleSort = (option: string) => {
    setSortOption(option);
    setShowSortMenu(false);
  };

  const handleSortOrder = (order: 'asc' | 'desc') => {
    setSortOrder(order);
    setShowSortMenu(false);
  };

  const deleteFolder = () => {
    if (window.confirm(`Are you sure you want to delete the folder "${folder.name}"? All subscriptions in this folder will be moved to the root level.`)) {
      dispatch({ type: 'DELETE_FOLDER', payload: folder.id });
    }
  };

  const handleEdit = () => {
    setEditForm({ name: folder.name, icon: folder.icon });
    setIsEditing(true);
  };

  const handleSaveEdit = () => {
    if (!editForm.name.trim() || !editForm.icon.trim()) {
      alert('Please fill in all fields');
      return;
    }

    dispatch({ 
      type: 'UPDATE_FOLDER', 
      payload: { ...folder, name: editForm.name, icon: editForm.icon }
    });
    setIsEditing(false);
  };

  // Calculate stats
  let alertCount = 0;
  let warningCount = 0;
  let normalCount = 0;

  folderSubscriptions.forEach(sub => {
    const countdownInfo = getCountdownInfo(sub);
    if (countdownInfo.daysLeft <= 1 || countdownInfo.daysLeft < 0) {
      alertCount++;
    } else if (countdownInfo.daysLeft <= 3) {
      warningCount++;
    } else {
      normalCount++;
    }
  });

  return (
    <Layout isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode}>
      <div className="folder-header">        
        <div className="folder-title-section">
          <div className="folder-icon-large">{folder.icon}</div>
          <div className="folder-details">
            <h2 className="folder-title">{folder.name}</h2>
            <div className="folder-stats-compact">
              <div className="stat-item">
                <span className="stat-count">{folderSubscriptions.length}</span> items
              </div>
              <div className="stat-item stat-red">
                <span className="stat-count">{alertCount}</span> 🍅
              </div>
              <div className="stat-item stat-orange">
                <span className="stat-count">{warningCount}</span> 🍊
              </div>
              <div className="stat-item stat-green">
                <span className="stat-count">{normalCount}</span> 🍏
              </div>
            </div>
          </div>
          <div className="folder-actions">
            <button className="action-btn" title="Edit folder" onClick={handleEdit}>
              <Edit size={14} />
            </button>
            <button className="action-btn" title="Delete folder" onClick={deleteFolder}>
              <Trash size={14} />
            </button>
          </div>
        </div>
      </div>

      <div className="folder-search-row">
        <div className="search-input-wrapper" style={{ flex: 1 }}>
          <Search size={14} className="search-icon" />
          <input
            type="text"
            className="search-bar"
            placeholder="Search in folder..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="folder-action-buttons">
          <button 
            className="btn btn-secondary"
            onClick={() => {
              setShowFilterMenu(!showFilterMenu);
              setShowSortMenu(false);
            }}
            title="Filter"
          >
            <Filter size={14} />
            {showFilterMenu && (
              <div className="dropdown-menu">
                <div style={{ padding: '10px 15px', fontWeight: '600', borderBottom: '1px solid var(--border-color)' }}>
                  Filter by Tags
                </div>
                {allTags.map(tag => (
                  <button
                    key={tag}
                    className="dropdown-item"
                    onClick={() => toggleTag(tag)}
                    style={{ 
                      backgroundColor: selectedTags.includes(tag) ? 'var(--accent-primary)' : 'transparent',
                      color: selectedTags.includes(tag) ? 'white' : 'var(--text-primary)'
                    }}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            )}
          </button>
          <button 
            className="btn btn-secondary"
            onClick={() => {
              setShowSortMenu(!showSortMenu);
              setShowFilterMenu(false);
            }}
            title="Sort"
          >
            <ArrowUpDown size={14} />
            {showSortMenu && (
              <div className="dropdown-menu">
                <div style={{ padding: '10px 15px', fontWeight: '600', borderBottom: '1px solid var(--border-color)' }}>
                  Sort by
                </div>
                {[
                  { key: 'name', label: 'Name' },
                  { key: 'amount', label: 'Amount' },
                  { key: 'date', label: 'Due Date' },
                  { key: 'tag', label: 'Tag' }
                ].map(option => (
                  <button
                    key={option.key}
                    className="dropdown-item"
                    onClick={() => handleSort(option.key)}
                    style={{ 
                      backgroundColor: sortOption === option.key ? 'var(--accent-primary)' : 'transparent',
                      color: sortOption === option.key ? 'white' : 'var(--text-primary)'
                    }}
                  >
                    {option.label}
                  </button>
                ))}
                <div style={{ borderTop: '1px solid var(--border-color)', padding: '5px 0' }}>
                  <button
                    className="dropdown-item"
                    onClick={() => handleSortOrder('asc')}
                    style={{ 
                      backgroundColor: sortOrder === 'asc' ? 'var(--accent-primary)' : 'transparent',
                      color: sortOrder === 'asc' ? 'white' : 'var(--text-primary)'
                    }}
                  >
                    Ascending
                  </button>
                  <button
                    className="dropdown-item"
                    onClick={() => handleSortOrder('desc')}
                    style={{ 
                      backgroundColor: sortOrder === 'desc' ? 'var(--accent-primary)' : 'transparent',
                      color: sortOrder === 'desc' ? 'white' : 'var(--text-primary)'
                    }}
                  >
                    Descending
                  </button>
                </div>
              </div>
            )}
          </button>
          <button 
            className="btn btn-primary"
            onClick={() => setShowSubscriptionForm(true)}
            title="Add Subscription"
          >
            <Plus size={14} />
          </button>
        </div>
      </div>

      <div className="divider"></div>

      <div className="content">
        {isEditing && (
          <div className="form-container">
            <div className="form-header">
              <h3 className="form-title">
                <Edit size={16} />
                Edit Folder
              </h3>
              <button className="close-btn" onClick={() => setIsEditing(false)}>
                ×
              </button>
            </div>
            
            <div className="form-group">
              <label htmlFor="editFolderName">Folder Name *</label>
              <input
                type="text"
                className="form-control"
                id="editFolderName"
                placeholder="Enter folder name"
                value={editForm.name}
                onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="editFolderIcon">Folder Icon (Emoji) *</label>
              <input
                type="text"
                className="form-control"
                id="editFolderIcon"
                placeholder="Enter emoji"
                maxLength={2}
                value={editForm.icon}
                onChange={(e) => setEditForm({...editForm, icon: e.target.value})}
                required
              />
            </div>
            
            <div className="form-actions">
              <button type="button" className="btn btn-secondary" onClick={() => setIsEditing(false)}>
                Cancel
              </button>
              <button type="button" className="btn btn-primary" onClick={handleSaveEdit}>
                Save Changes
              </button>
            </div>
          </div>
        )}

        {showSubscriptionForm && (
          <SubscriptionForm 
            onClose={() => setShowSubscriptionForm(false)}
            folders={state.folders}
            defaultFolderId={folder.id}
          />
        )}

        <h3 className="section-title">
          Subscriptions
        </h3>
        
        <div className="cards-container">
          {filteredSubscriptions.map(subscription => (
            <SubscriptionCard 
              key={subscription.id} 
              subscription={subscription}
              folders={state.folders}
            />
          ))}
        </div>

        {filteredSubscriptions.length === 0 && (
          <div className="empty-state">
            <Search size={32} />
            <p>No subscriptions in this folder</p>
          </div>
        )}
      </div>
    </Layout>
  );
}