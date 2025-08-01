import React, { useState } from 'react';
import { useSubscriptions } from '../context/SubscriptionContext';
import { X, Folder } from 'lucide-react';

interface FolderFormProps {
  onClose: () => void;
}

export default function FolderForm({ onClose }: FolderFormProps) {
  const { dispatch } = useSubscriptions();
  const [formData, setFormData] = useState({
    name: '',
    icon: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.icon) {
      alert('Please fill in all fields');
      return;
    }

    const newFolder = {
      id: Date.now().toString(),
      name: formData.name,
      icon: formData.icon
    };

    dispatch({ type: 'ADD_FOLDER', payload: newFolder });
    onClose();
  };

  return (
    <div className="form-container">
      <div className="form-header">
        <h3 className="form-title">
          <Folder size={18} fill="currentColor" /> Create New Folder
        </h3>
        <button className="close-btn" onClick={onClose}>
          <X size={16} />
        </button>
      </div>
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="folderName">Folder Name *</label>
          <input
            type="text"
            className="form-control"
            id="folderName"
            placeholder="Enter folder name"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="folderIcon">Folder Icon (Emoji) *</label>
          <input
            type="text"
            className="form-control"
            id="folderIcon"
            placeholder="Enter emoji"
            maxLength={2}
            value={formData.icon}
            onChange={(e) => setFormData({...formData, icon: e.target.value})}
            required
          />
        </div>
        
        <div className="form-actions">
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary">
            Create
          </button>
        </div>
      </form>
    </div>
  );
}