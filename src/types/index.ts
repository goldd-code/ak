export interface Subscription {
  id: string;
  name: string;
  amount: number;
  dueDate: string;
  repeat: 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly';
  link?: string;
  tag: string;
  folderId?: string | null;
  archived: boolean;
}

export interface Folder {
  id: string;
  name: string;
  icon: string;
}

export interface CountdownInfo {
  text: string;
  cssClass: string;
  daysLeft: number;
  nextDueDate: Date;
}

export interface ChartDataPoint {
  date: string;
  amount: number;
  label?: string;
}

export interface AnalyticsData {
  activeSubscriptions: number;
  archivedSubscriptions: number;
  nextPayment: number;
  nextPaymentDate: string;
  monthlySpending: number;
  yearlySpending: number;
  totalSpent: number;
  spendingTrends: ChartDataPoint[];
  renewalCalendar: Array<{
    date: string;
    count: number;
    amount: number;
    subscriptions: string[];
  }>;
  spendingByFolder: Array<{
    name: string;
    amount: number;
    color: string;
  }>;
  spendingByTag: Array<{
    name: string;
    amount: number;
    color: string;
  }>;
  lifetimeProjections: Array<{
    name: string;
    monthlyAmount: number;
    yearlyAmount: number;
    tenYearProjection: number;
  }>;
  savingsSimulation: Array<{
    name: string;
    monthlyAmount: number;
    annualSavings: number;
  }>;
}