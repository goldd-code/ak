import React from 'react';
import Layout from '../components/Layout';
import SubscriptionCard from '../components/SubscriptionCard';
import { useSubscriptions } from '../context/SubscriptionContext';
import { Archive, DollarSign } from 'lucide-react';

interface ArchivePageProps {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

export default function ArchivePage({ isDarkMode, toggleDarkMode }: ArchivePageProps) {
  const { state } = useSubscriptions();
  
  const archivedSubscriptions = state.subscriptions.filter(sub => sub.archived);
  
  // Calculate money saved from archived subscriptions
  const moneySaved = archivedSubscriptions.reduce((total, sub) => {
    if (sub.repeat === 'monthly') return total + sub.amount;
    if (sub.repeat === 'yearly') return total + (sub.amount / 12);
    if (sub.repeat === 'weekly') return total + (sub.amount * 4.33);
    if (sub.repeat === 'daily') return total + (sub.amount * 30);
    return total;
  }, 0);

  return (
    <Layout isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode}>
      <div className="content">
        <div className="archive-header">
          <h2 className="section-title">
            <Archive size={20} />
            Archived Subscriptions
          </h2>
          
          {archivedSubscriptions.length > 0 && (
            <div className="savings-card">
              <div className="savings-icon">
                <DollarSign size={18} />
              </div>
              <div className="savings-content">
                <div className="savings-amount">${moneySaved.toFixed(2)}</div>
                <div className="savings-label">Monthly Savings</div>
                <div className="savings-subtitle">
                  From {archivedSubscriptions.length} inactive subscription{archivedSubscriptions.length !== 1 ? 's' : ''}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="cards-container">
          {archivedSubscriptions.map(subscription => (
            <SubscriptionCard 
              key={subscription.id} 
              subscription={subscription}
              folders={state.folders}
            />
          ))}
        </div>

        {archivedSubscriptions.length === 0 && (
          <div className="empty-state">
            <Archive size={32} />
            <p>No archived subscriptions</p>
          </div>
        )}
      </div>
    </Layout>
  );
}