import React, { useState } from 'react';
import Layout from '../components/Layout';
import SubscriptionCard from '../components/SubscriptionCard';
import FolderCard from '../components/FolderCard';
import SubscriptionForm from '../components/SubscriptionForm';
import FolderForm from '../components/FolderForm';
import { useSubscriptions } from '../context/SubscriptionContext';
import { Search, Plus, FolderPlus, Filter, ArrowUpDown, CreditCard, Folder, Home } from 'lucide-react';

interface HomePageProps {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

export default function HomePage({ isDarkMode, toggleDarkMode }: HomePageProps) {
  const { state } = useSubscriptions();
  const [searchTerm, setSearchTerm] = useState('');
  const [showSubscriptionForm, setShowSubscriptionForm] = useState(false);
  const [showFolderForm, setShowFolderForm] = useState(false);
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [sortOption, setSortOption] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const activeSubscriptions = state.subscriptions.filter(sub => !sub.archived);
  
  // Enhanced search - search through all subscriptions including those in folders
  let filteredSubscriptions = activeSubscriptions;
  let filteredFolders = state.folders;

  if (searchTerm) {
    // Search through all subscriptions
    filteredSubscriptions = activeSubscriptions.filter(sub => 
      sub.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      sub.tag.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    // Search through folders
    filteredFolders = state.folders.filter(folder => 
      folder.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  } else {
    // Only show root subscriptions when not searching
    filteredSubscriptions = activeSubscriptions.filter(sub => !sub.folderId);
  }

  // Apply tag filter
  if (selectedTags.length > 0) {
    filteredSubscriptions = filteredSubscriptions.filter(sub => 
      selectedTags.includes(sub.tag)
    );
  }

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
  const rootSubscriptions = activeSubscriptions.filter(sub => !sub.folderId);

  // Get unique tags
  const allTags = [...new Set(activeSubscriptions.map(sub => sub.tag))];

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

  return (
    <Layout isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode}>
      <div className="search-bar-container">
        <div className="search-input-wrapper">
          <Search size={16} className="search-icon" fill="currentColor" />
          <input
            type="text"
            className="search-bar"
            placeholder="Search all subscriptions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="action-buttons">
        <button 
          className="btn btn-primary"
          onClick={() => setShowFolderForm(true)}
        >
          <FolderPlus size={16} fill="currentColor" />
          Add Folder
        </button>
        <button 
          className="btn btn-primary"
          onClick={() => setShowSubscriptionForm(true)}
        >
          <Plus size={16} fill="currentColor" />
          Add Subscription
        </button>
      </div>

      <div className="utility-buttons">
        <button 
          className="btn btn-secondary"
          onClick={() => {
            setShowFilterMenu(!showFilterMenu);
            setShowSortMenu(false);
          }}
        >
          <Filter size={14} />
          Filter
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
        >
          <ArrowUpDown size={14} />
          Sort
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
      </div>

      <div className="divider"></div>

      <div className="content">
        {showSubscriptionForm && (
          <SubscriptionForm 
            onClose={() => setShowSubscriptionForm(false)}
            folders={state.folders}
          />
        )}

        {showFolderForm && (
          <FolderForm onClose={() => setShowFolderForm(false)} />
        )}

        <h3 className="section-title">
          <CreditCard size={18} /> Subscriptions
          <span className="section-counter">{filteredSubscriptions.length}</span>
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

        {!searchTerm && (
          <>
            <h3 className="section-title">
              <Folder size={18} /> Folders
              <span className="section-counter">{filteredFolders.length}</span>
            </h3>
            <div className="cards-container">
              {filteredFolders.map(folder => (
                <FolderCard 
                  key={folder.id} 
                  folder={folder}
                  subscriptions={activeSubscriptions.filter(sub => sub.folderId === folder.id)}
                />
              ))}
            </div>
          </>
        )}

        {filteredSubscriptions.length === 0 && filteredFolders.length === 0 && (
          <div className="empty-state">
            <Home size={32} />
            <p>Nothing yet. Add your first subscription or folder!</p>
          </div>
        )}
      </div>
    </Layout>
  );
}