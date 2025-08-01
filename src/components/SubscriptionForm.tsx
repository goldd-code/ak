import React, { useState } from 'react';
import { useSubscriptions } from '../context/SubscriptionContext';
import { Folder } from '../types';
import { X, CreditCard } from 'lucide-react';

interface SubscriptionFormProps {
  onClose: () => void;
  folders: Folder[];
  defaultFolderId?: string;
}

export default function SubscriptionForm({ onClose, folders, defaultFolderId }: SubscriptionFormProps) {
  const { dispatch } = useSubscriptions();
  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    dueDate: '',
    repeat: 'monthly',
    link: '',
    tag: '',
    folderId: defaultFolderId || ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.amount || !formData.dueDate) {
      alert('Please fill in all required fields');
      return;
    }

    const newSubscription = {
      id: Date.now().toString(),
      name: formData.name,
      amount: parseFloat(formData.amount),
      dueDate: formData.dueDate,
      repeat: formData.repeat as any,
      link: formData.link,
      tag: formData.tag || 'General',
      folderId: formData.folderId || null,
      archived: false
    };

    dispatch({ type: 'ADD_SUBSCRIPTION', payload: newSubscription });
    onClose();
  };

  return (
    <div className="form-container">
      <div className="form-header">
        <h3 className="form-title">
          <CreditCard size={16} /> Add New Subscription
        </h3>
        <button className="close-btn" onClick={onClose}>
          <X size={16} />
        </button>
      </div>
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="subName">Service Name *</label>
          <input
            type="text"
            className="form-control"
            id="subName"
            placeholder="e.g. Netflix"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="subAmount">Amount ($) *</label>
          <input
            type="number"
            className="form-control"
            id="subAmount"
            placeholder="e.g. 14.99"
            step="0.01"
            value={formData.amount}
            onChange={(e) => setFormData({...formData, amount: e.target.value})}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="subDueDate">Due Date *</label>
          <input
            type="date"
            className="form-control"
            id="subDueDate"
            value={formData.dueDate}
            onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="subRepeat">Repeat</label>
          <select
            className="form-control"
            id="subRepeat"
            value={formData.repeat}
            onChange={(e) => setFormData({...formData, repeat: e.target.value})}
          >
            <option value="none">None</option>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
          </select>
        </div>
        
        <div className="form-group">
          <label htmlFor="subLink">Service Link</label>
          <input
            type="url"
            className="form-control"
            id="subLink"
            placeholder="https://"
            value={formData.link}
            onChange={(e) => setFormData({...formData, link: e.target.value})}
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="subTag">Tag</label>
          <input
            type="text"
            className="form-control"
            id="subTag"
            placeholder="e.g. Entertainment"
            value={formData.tag}
            onChange={(e) => setFormData({...formData, tag: e.target.value})}
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="subFolder">Folder</label>
          <select
            className="form-control"
            id="subFolder"
            value={formData.folderId}
            onChange={(e) => setFormData({...formData, folderId: e.target.value})}
          >
            <option value="">No Folder</option>
            {folders.map(folder => (
              <option key={folder.id} value={folder.id}>
                {folder.name}
              </option>
            ))}
          </select>
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