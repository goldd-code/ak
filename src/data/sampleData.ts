import { SubscriptionState } from '../context/SubscriptionContext';

const today = new Date();
const tomorrow = new Date(today);
tomorrow.setDate(tomorrow.getDate() + 1);
const in2Days = new Date(today);
in2Days.setDate(in2Days.getDate() + 2);
const in3Days = new Date(today);
in3Days.setDate(in3Days.getDate() + 3);
const in4Days = new Date(today);
in4Days.setDate(in4Days.getDate() + 4);

const formatForInput = (date: Date) => date.toISOString().split('T')[0];

export const sampleData: SubscriptionState = {
  subscriptions: [
    {
      id: '1',
      name: 'Netflix',
      amount: 15.99,
      dueDate: formatForInput(today),
      repeat: 'monthly',
      link: 'https://netflix.com',
      tag: 'Entertainment',
      folderId: '101',
      archived: false
    },
    {
      id: '2',
      name: 'Spotify Premium',
      amount: 9.99,
      dueDate: formatForInput(tomorrow),
      repeat: 'monthly',
      link: 'https://spotify.com',
      tag: 'Music',
      folderId: '101',
      archived: false
    },
    {
      id: '3',
      name: 'Amazon Prime',
      amount: 12.99,
      dueDate: formatForInput(in2Days),
      repeat: 'yearly',
      link: 'https://amazon.com/prime',
      tag: 'Shopping',
      folderId: '103',
      archived: false
    },
    {
      id: '4',
      name: 'YouTube Premium',
      amount: 11.99,
      dueDate: formatForInput(in3Days),
      repeat: 'monthly',
      link: 'https://youtube.com/premium',
      tag: 'Entertainment',
      folderId: null,
      archived: false
    },
    {
      id: '5',
      name: 'Adobe Creative Cloud',
      amount: 52.99,
      dueDate: formatForInput(in4Days),
      repeat: 'monthly',
      link: 'https://adobe.com',
      tag: 'Software',
      folderId: '102',
      archived: false
    },
    {
      id: '6',
      name: 'Old Gaming Service',
      amount: 19.99,
      dueDate: formatForInput(today),
      repeat: 'monthly',
      link: 'https://example.com',
      tag: 'Gaming',
      folderId: null,
      archived: true
    }
  ],
  folders: [
    {
      id: '101',
      name: 'Streaming',
      icon: '🎬'
    },
    {
      id: '102',
      name: 'Utilities',
      icon: '🔧'
    },
    {
      id: '103',
      name: 'Shop',
      icon: '🛒'
    },
    {
      id: '104',
      name: 'Productivity',
      icon: '📊'
    }
  ],
  sortOption: null,
  sortOrder: 'asc'
};