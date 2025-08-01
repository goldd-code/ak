import React, { useState } from 'react';
import { useSubscriptions } from '../context/SubscriptionContext';
import { getCountdownInfo, formatDate, getFrequencyShortcut } from '../utils/dateUtils';
import { Subscription, Folder } from '../types';
import { Edit2, Trash2, Archive, ExternalLink, FolderOpen, Calendar, DollarSign, Clock } from 'lucide-react';

interface SubscriptionCardProps {
  subscription: Subscription;
  folders: Folder[];
}

export default function SubscriptionCard({ subscription, folders }: SubscriptionCardProps) {
  const { dispatch } = useSubscriptions();
  const [isEditing, setIsEditing] = useState(false);
  const [showFolderMenu, setShowFolderMenu] = useState(false);
  const [editForm, setEditForm] = useState(subscription);

  const countdownInfo = getCountdownInfo(subscription);
  const frequencyShortcut = getFrequencyShortcut(subscription.repeat);

  const handleEdit = () => {
    setIsEditing(true);
    setEditForm(subscription);
  };

  const handleSave = () => {
    dispatch({ type: 'UPDATE_SUBSCRIPTION', payload: editForm });
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete "${subscription.name}"?`)) {
      dispatch({ type: 'DELETE_SUBSCRIPTION', payload: subscription.id });
    }
  };

  const handleToggleArchive = () => {
    dispatch({ type: 'TOGGLE_ARCHIVE', payload: subscription.id });
  };

  const handleMoveToFolder = () => {
    setShowFolderMenu(!showFolderMenu);
  };

  const moveToFolder = (folderId: string | null) => {
    dispatch({ 
      type: 'UPDATE_SUBSCRIPTION', 
      payload: { ...subscription, folderId }
    });
    setShowFolderMenu(false);
  };

  return (
    <div className="subscription-card" style={{ position: 'relative' }}>
      <div className="card-header">
        <div className="card-title">{subscription.name}</div>
        <div className="tag">{subscription.tag}</div>
      </div>
      
      <div className="details-row">
        <div className="due-date">
          <Calendar size={14} fill="currentColor" />
          Due: {formatDate(countdownInfo.nextDueDate)}
        </div>
        <div className="amount-frequency">
          <DollarSign size={14} fill="currentColor" />
          ${subscription.amount.toFixed(2)}{frequencyShortcut}
        </div>
      </div>
      
      <div className="actions-row">
        <div className={`countdown ${countdownInfo.cssClass}`}>
          <Clock size={14} fill="currentColor" />
          {countdownInfo.text}
        </div>
        <div className="card-actions">
          <button 
            className="card-actions-btn"
            onClick={handleEdit}
            title="Edit"
          >
            <Edit2 size={14} fill="currentColor" />
          </button>
          <button 
            className="card-actions-btn"
            onClick={handleMoveToFolder}
            title="Move to Folder"
            style={{ position: 'relative' }}
          >
            <FolderOpen size={14} fill="currentColor" />
            {showFolderMenu && (
              <div className="folder-dropdown">
                <button onClick={() => moveToFolder(null)}>
                  No Folder
                </button>
                {folders.map(folder => (
                  <button key={folder.id} onClick={() => moveToFolder(folder.id)}>
                    {folder.icon} {folder.name}
                  </button>
                ))}
              </div>
            )}
          </button>
          <button 
            className="card-actions-btn"
            onClick={handleDelete}
            title="Delete"
          >
            <Trash2 size={14} fill="currentColor" />
          </button>
          <button 
            className="card-actions-btn archive-btn"
            onClick={handleToggleArchive}
            title={subscription.archived ? "Unarchive" : "Archive"}
          >
            <Archive size={14} fill="currentColor" />
          </button>
          {subscription.link && (
            <a 
              href={subscription.link}
              target="_blank"
              rel="noopener noreferrer"
              className="card-actions-btn"
              title="Open service"
            >
              <ExternalLink size={14} fill="currentColor" />
            </a>
          )}
        </div>
      </div>

      {isEditing && (
        <div className="edit-form">
          <div className="form-group">
            <label>Name</label>
            <input
              type="text"
              className="form-control"
              value={editForm.name}
              onChange={(e) => setEditForm({...editForm, name: e.target.value})}
            />
          </div>
          <div className="form-group">
            <label>Amount ($)</label>
            <input
              type="number"
              className="form-control"
              value={editForm.amount}
              step="0.01"
              onChange={(e) => setEditForm({...editForm, amount: parseFloat(e.target.value)})}
            />
          </div>
          <div className="form-group">
            <label>Due Date</label>
            <input
              type="date"
              className="form-control"
              value={editForm.dueDate}
              onChange={(e) => setEditForm({...editForm, dueDate: e.target.value})}
            />
          </div>
          <div className="form-group">
            <label>Repeat</label>
            <select
              className="form-control"
              value={editForm.repeat}
              onChange={(e) => setEditForm({...editForm, repeat: e.target.value as any})}
            >
              <option value="none">None</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </select>
          </div>
          <div className="form-group">
            <label>Tag</label>
            <input
              type="text"
              className="form-control"
              value={editForm.tag}
              onChange={(e) => setEditForm({...editForm, tag: e.target.value})}
            />
          </div>
          <div className="form-group">
            <label>Link</label>
            <input
              type="url"
              className="form-control"
              value={editForm.link || ''}
              onChange={(e) => setEditForm({...editForm, link: e.target.value})}
            />
          </div>
          <div className="form-group">
            <label>Folder</label>
            <select
              className="form-control"
              value={editForm.folderId || ''}
              onChange={(e) => setEditForm({...editForm, folderId: e.target.value || null})}
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
            <button 
              className="btn btn-secondary"
              onClick={() => setIsEditing(false)}
            >
              Cancel
            </button>
            <button 
              className="btn btn-primary"
              onClick={handleSave}
            >
              Save
            </button>
          </div>
        </div>
      )}
    </div>
  );
}