import React from 'react';
import { Link } from 'react-router-dom';
import { Folder, Subscription } from '../types';
import { getCountdownInfo } from '../utils/dateUtils';

interface FolderCardProps {
  folder: Folder;
  subscriptions: Subscription[];
}

export default function FolderCard({ folder, subscriptions }: FolderCardProps) {
  // Calculate folder stats
  let alertCount = 0;
  let warningCount = 0;
  let normalCount = 0;

  subscriptions.forEach(sub => {
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
    <Link to={`/folder/${folder.id}`} className="folder-card">
      <div className="folder-icon" style={{ color: 'var(--accent-primary)' }}>{folder.icon}</div>
      <div className="folder-content">
        <div className="folder-header">
          <div className="folder-name">{folder.name}</div>
        </div>
        <div className="folder-stats">
          <div className="stat-item">
            <span className="stat-count">{subscriptions.length}</span> items
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
    </Link>
  );
}