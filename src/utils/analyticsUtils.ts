import { Subscription, Folder, AnalyticsData, ChartDataPoint } from '../types';
import { getNextOccurrence } from './dateUtils';

export function calculateAnalytics(subscriptions: Subscription[], folders: Folder[]): AnalyticsData {
  const activeSubscriptions = subscriptions.filter(sub => !sub.archived);
  const archivedSubscriptions = subscriptions.filter(sub => sub.archived);

  // Calculate next payment (nearest date and total amount for that date)
  const upcomingPayments = activeSubscriptions.map(sub => ({
    ...sub,
    nextDueDate: getNextOccurrence(sub.dueDate, sub.repeat)
  }));

  // Find the nearest payment date
  const nearestDate = upcomingPayments.reduce((nearest, payment) => {
    return payment.nextDueDate < nearest ? payment.nextDueDate : nearest;
  }, new Date(8640000000000000)); // Max date

  const nextPayment = upcomingPayments
    .filter(payment => payment.nextDueDate.toDateString() === nearestDate.toDateString())
    .reduce((sum, payment) => sum + payment.amount, 0);

  // Calculate monthly spending (next month forecast)
  const today = new Date();
  const nextMonthStart = new Date(today.getFullYear(), today.getMonth() + 1, 1);
  const nextMonthEnd = new Date(today.getFullYear(), today.getMonth() + 2, 0);
  
  let monthlySpending = 0;
  activeSubscriptions.forEach(sub => {
    let currentDate = getNextOccurrence(sub.dueDate, sub.repeat);
    while (currentDate <= nextMonthEnd) {
      if (currentDate >= nextMonthStart) {
        monthlySpending += sub.amount;
      }
      // Move to next occurrence
      if (sub.repeat === 'daily') {
        currentDate = new Date(currentDate.getTime() + 24 * 60 * 60 * 1000);
      } else if (sub.repeat === 'weekly') {
        currentDate = new Date(currentDate.getTime() + 7 * 24 * 60 * 60 * 1000);
      } else if (sub.repeat === 'monthly') {
        currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, currentDate.getDate());
      } else if (sub.repeat === 'yearly') {
        currentDate = new Date(currentDate.getFullYear() + 1, currentDate.getMonth(), currentDate.getDate());
      } else {
        break; // one-time payment
      }
    }
  });

  // Calculate yearly spending (next year forecast)
  const nextYearStart = new Date(today.getFullYear() + 1, 0, 1);
  const nextYearEnd = new Date(today.getFullYear() + 1, 11, 31);
  
  let yearlySpending = 0;
  activeSubscriptions.forEach(sub => {
    let currentDate = getNextOccurrence(sub.dueDate, sub.repeat);
    while (currentDate <= nextYearEnd) {
      if (currentDate >= nextYearStart) {
        yearlySpending += sub.amount;
      }
      // Move to next occurrence
      if (sub.repeat === 'daily') {
        currentDate = new Date(currentDate.getTime() + 24 * 60 * 60 * 1000);
      } else if (sub.repeat === 'weekly') {
        currentDate = new Date(currentDate.getTime() + 7 * 24 * 60 * 60 * 1000);
      } else if (sub.repeat === 'monthly') {
        currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, currentDate.getDate());
      } else if (sub.repeat === 'yearly') {
        currentDate = new Date(currentDate.getFullYear() + 1, currentDate.getMonth(), currentDate.getDate());
      } else {
        break; // one-time payment
      }
    }
  });

  // Generate spending trends (last 6 months)
  const spendingTrends: ChartDataPoint[] = [];
  for (let i = 5; i >= 0; i--) {
    const monthStart = new Date(today.getFullYear(), today.getMonth() - i, 1);
    const monthEnd = new Date(today.getFullYear(), today.getMonth() - i + 1, 0);
    
    let monthSpending = 0;
    activeSubscriptions.forEach(sub => {
      let currentDate = getNextOccurrence(sub.dueDate, sub.repeat);
      // Simulate past months
      while (currentDate.getTime() > monthStart.getTime() - (365 * 24 * 60 * 60 * 1000)) {
        if (currentDate >= monthStart && currentDate <= monthEnd) {
          monthSpending += sub.amount;
        }
        // Move backwards for historical simulation
        if (sub.repeat === 'monthly') {
          currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, currentDate.getDate());
        } else if (sub.repeat === 'yearly') {
          currentDate = new Date(currentDate.getFullYear() - 1, currentDate.getMonth(), currentDate.getDate());
        } else {
          break;
        }
      }
    });
    
    spendingTrends.push({
      date: monthStart.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      amount: monthSpending
    });
  }

  // Generate renewal calendar for current month
  const currentMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);
  const currentMonthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  const renewalCalendar: Array<{
    date: string;
    count: number;
    amount: number;
    subscriptions: string[];
  }> = [];

  for (let day = 1; day <= currentMonthEnd.getDate(); day++) {
    const currentDay = new Date(today.getFullYear(), today.getMonth(), day);
    const dayPayments = upcomingPayments.filter(payment => {
      const paymentDate = new Date(payment.nextDueDate);
      return paymentDate.getDate() === day && 
             paymentDate.getMonth() === today.getMonth() &&
             paymentDate.getFullYear() === today.getFullYear();
    });

    if (dayPayments.length > 0) {
      renewalCalendar.push({
        date: currentDay.toISOString().split('T')[0],
        count: dayPayments.length,
        amount: dayPayments.reduce((sum, p) => sum + p.amount, 0),
        subscriptions: dayPayments.map(p => p.name)
      });
    }
  }

  // Calculate spending by folder
  const spendingByFolder = folders.map(folder => {
    const folderSubs = activeSubscriptions.filter(sub => sub.folderId === folder.id);
    const monthlyAmount = folderSubs.reduce((sum, sub) => {
      if (sub.repeat === 'monthly') return sum + sub.amount;
      if (sub.repeat === 'yearly') return sum + (sub.amount / 12);
      if (sub.repeat === 'weekly') return sum + (sub.amount * 4.33);
      if (sub.repeat === 'daily') return sum + (sub.amount * 30);
      return sum;
    }, 0);
    
    return {
      name: folder.name,
      amount: monthlyAmount,
      color: `hsl(${Math.random() * 360}, 70%, 50%)`
    };
  }).filter(item => item.amount > 0);

  // Add "No Folder" category
  const noFolderSubs = activeSubscriptions.filter(sub => !sub.folderId);
  if (noFolderSubs.length > 0) {
    const noFolderAmount = noFolderSubs.reduce((sum, sub) => {
      if (sub.repeat === 'monthly') return sum + sub.amount;
      if (sub.repeat === 'yearly') return sum + (sub.amount / 12);
      if (sub.repeat === 'weekly') return sum + (sub.amount * 4.33);
      if (sub.repeat === 'daily') return sum + (sub.amount * 30);
      return sum;
    }, 0);
    
    spendingByFolder.push({
      name: 'No Folder',
      amount: noFolderAmount,
      color: '#6B7280'
    });
  }

  // Calculate spending by tag
  const tagMap = new Map<string, number>();
  activeSubscriptions.forEach(sub => {
    const monthlyAmount = (() => {
      if (sub.repeat === 'monthly') return sub.amount;
      if (sub.repeat === 'yearly') return sub.amount / 12;
      if (sub.repeat === 'weekly') return sub.amount * 4.33;
      if (sub.repeat === 'daily') return sub.amount * 30;
      return 0;
    })();
    
    tagMap.set(sub.tag, (tagMap.get(sub.tag) || 0) + monthlyAmount);
  });

  const spendingByTag = Array.from(tagMap.entries()).map(([name, amount]) => ({
    name,
    amount,
    color: `hsl(${Math.random() * 360}, 70%, 50%)`
  }));

  // Calculate lifetime projections
  const lifetimeProjections = activeSubscriptions.map(sub => {
    const monthlyAmount = (() => {
      if (sub.repeat === 'monthly') return sub.amount;
      if (sub.repeat === 'yearly') return sub.amount / 12;
      if (sub.repeat === 'weekly') return sub.amount * 4.33;
      if (sub.repeat === 'daily') return sub.amount * 30;
      return 0;
    })();

    return {
      name: sub.name,
      monthlyAmount,
      yearlyAmount: monthlyAmount * 12,
      tenYearProjection: monthlyAmount * 120
    };
  }).sort((a, b) => b.tenYearProjection - a.tenYearProjection);

  // Calculate savings simulation
  const savingsSimulation = activeSubscriptions.map(sub => {
    const monthlyAmount = (() => {
      if (sub.repeat === 'monthly') return sub.amount;
      if (sub.repeat === 'yearly') return sub.amount / 12;
      if (sub.repeat === 'weekly') return sub.amount * 4.33;
      if (sub.repeat === 'daily') return sub.amount * 30;
      return 0;
    })();

    return {
      name: sub.name,
      monthlyAmount,
      annualSavings: monthlyAmount * 12
    };
  }).sort((a, b) => b.annualSavings - a.annualSavings);

  // Calculate total spent (simulated based on active subscriptions)
  const totalSpent = activeSubscriptions.reduce((sum, sub) => {
    const monthlyAmount = (() => {
      if (sub.repeat === 'monthly') return sub.amount;
      if (sub.repeat === 'yearly') return sub.amount / 12;
      if (sub.repeat === 'weekly') return sub.amount * 4.33;
      if (sub.repeat === 'daily') return sub.amount * 30;
      return 0;
    })();
    return sum + (monthlyAmount * 6); // Simulate 6 months of spending
  }, 0);

  return {
    activeSubscriptions: activeSubscriptions.length,
    archivedSubscriptions: archivedSubscriptions.length,
    nextPayment,
    nextPaymentDate: nearestDate.toISOString().split('T')[0],
    monthlySpending,
    yearlySpending,
    totalSpent,
    spendingTrends,
    renewalCalendar,
    spendingByFolder,
    spendingByTag,
    lifetimeProjections,
    savingsSimulation
  };
}