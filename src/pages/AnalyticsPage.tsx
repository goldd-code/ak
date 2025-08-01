import React, { useState, useMemo, useEffect } from 'react';
import Layout from '../components/Layout';
import InfoTooltip from '../components/InfoTooltip';
import SpendingTrendsChart from '../components/charts/SpendingTrendsChart';
import SpendingForecastChart from '../components/charts/SpendingForecastChart';
import RenewalCalendar from '../components/charts/RenewalCalendar';
import PieChart from '../components/charts/PieChart';
import { useSubscriptions } from '../context/SubscriptionContext';
import { calculateAnalytics } from '../utils/analyticsUtils';
import { Download, FileText, BarChart3, Calendar, TrendingUp, DollarSign } from 'lucide-react';

interface AnalyticsPageProps {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

export default function AnalyticsPage({ isDarkMode, toggleDarkMode }: AnalyticsPageProps) {
  const { state } = useSubscriptions();
  const [forecastPeriod, setForecastPeriod] = useState<3 | 6 | 12>(6);
  const [animateNumbers, setAnimateNumbers] = useState(false);
  
  const analytics = useMemo(() => 
    calculateAnalytics(state.subscriptions, state.folders), 
    [state.subscriptions, state.folders]
  );

  useEffect(() => {
    // Trigger number animation when component mounts
    const timer = setTimeout(() => {
      setAnimateNumbers(true);
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  const exportToPDF = () => {
    // Create a simple PDF-like report
    const reportData = [
      'SUBSCRIPTION ANALYTICS REPORT',
      `Generated on: ${new Date().toLocaleDateString()}`,
      '',
      'OVERVIEW:',
      `Active Subscriptions: ${analytics.activeSubscriptions}`,
      `Archived Subscriptions: ${analytics.archivedSubscriptions}`,
      `Next Payment: $${analytics.nextPayment.toFixed(2)}`,
      `Monthly Spending: $${analytics.monthlySpending.toFixed(2)}`,
      `Yearly Spending: $${analytics.yearlySpending.toFixed(2)}`,
      `Total Spent: $${analytics.totalSpent.toFixed(2)}`,
      '',
      'TOP LIFETIME PROJECTIONS:',
      ...analytics.lifetimeProjections.slice(0, 5).map((proj, i) => 
        `${i + 1}. ${proj.name}: $${proj.tenYearProjection.toFixed(2)} (10 years)`
      ),
      '',
      'POTENTIAL SAVINGS:',
      ...analytics.savingsSimulation.slice(0, 5).map((sim, i) => 
        `${i + 1}. ${sim.name}: $${sim.annualSavings.toFixed(2)} annually`
      )
    ].join('\n');
    
    const blob = new Blob([reportData], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `subscription-analytics-${new Date().toISOString().slice(0,10)}.txt`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const exportToCSV = () => {
    const csvData = [
      ['Metric', 'Value'],
      ['Active Subscriptions', analytics.activeSubscriptions.toString()],
      ['Archived Subscriptions', analytics.archivedSubscriptions.toString()],
      ['Next Payment', `$${analytics.nextPayment.toFixed(2)}`],
      ['Monthly Spending', `$${analytics.monthlySpending.toFixed(2)}`],
      ['Yearly Spending', `$${analytics.yearlySpending.toFixed(2)}`],
      ['Total Spent', `$${analytics.totalSpent.toFixed(2)}`]
    ];

    const csvContent = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'subscription-analytics.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <Layout isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode}>
      <div className="content">
        <div className="analytics-header">
          <h2 className="analytics-title">
            <BarChart3 size={24} fill="currentColor" />
            Analytics Dashboard
          </h2>
          <div className="export-buttons">
            <button className="btn btn-secondary" onClick={exportToPDF}>
              <FileText size={16} fill="currentColor" />
              PDF
            </button>
            <button className="btn btn-secondary" onClick={exportToCSV}>
              <Download size={16} fill="currentColor" />
              CSV
            </button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="stats-overview">
          <div className="stat-card-large">
            <div className="stat-icon">
              <DollarSign size={24} fill="currentColor" />
            </div>
            <div className="stat-content">
              <div className={`stat-value ${animateNumbers ? 'animate' : ''}`}>{analytics.activeSubscriptions}</div>
              <div className="stat-label">Active Subscriptions</div>
              <div className="stat-change stat-positive">
                vs {analytics.archivedSubscriptions} archived
              </div>
            </div>
            <InfoTooltip content="Number of currently active subscription services excluding archived ones" />
          </div>

          <div className="stat-card-large">
            <div className="stat-icon">
              <Calendar size={24} fill="currentColor" />
            </div>
            <div className="stat-content">
              <div className={`stat-value ${animateNumbers ? 'animate' : ''}`}>${analytics.nextPayment.toFixed(2)}</div>
              <div className="stat-label">Next Payment</div>
              <div className="stat-change stat-neutral">
                Due {new Date(analytics.nextPaymentDate).toLocaleDateString()}
              </div>
            </div>
            <InfoTooltip content="Total amount due on the nearest payment date, combining all subscriptions due on that day" />
          </div>

          <div className="stat-card-large">
            <div className="stat-icon">
              <TrendingUp size={24} fill="currentColor" />
            </div>
            <div className="stat-content">
              <div className={`stat-value ${animateNumbers ? 'animate' : ''}`}>${analytics.monthlySpending.toFixed(2)}</div>
              <div className="stat-label">Next Month Payment</div>
              <div className="stat-change stat-neutral">
                Forecasted
              </div>
            </div>
            <InfoTooltip content="Predicted total spending for the upcoming month based on subscription schedules" />
          </div>

          <div className="stat-card-large">
            <div className="stat-icon">
              <BarChart3 size={24} fill="currentColor" />
            </div>
            <div className="stat-content">
              <div className={`stat-value ${animateNumbers ? 'animate' : ''}`}>${analytics.totalSpent.toFixed(2)}</div>
              <div className="stat-label">All Time Spent</div>
              <div className="stat-change stat-neutral">
                Last 6 months
              </div>
            </div>
            <InfoTooltip content="Total amount spent on active subscriptions over the last 6 months (simulated data)" />
          </div>
        </div>

        {/* Charts Section */}
        <div className="charts-section">
          <div className="chart-container">
            <div className="chart-header">
              <h3>
                <TrendingUp size={20} fill="currentColor" />
                Spending Trends
                <InfoTooltip content="Historical spending patterns over the last 6 months to identify trends" />
              </h3>
            </div>
            <div className="chart-wrapper">
              <SpendingTrendsChart data={analytics.spendingTrends} />
            </div>
          </div>

          <div className="chart-container">
            <div className="chart-header">
              <h3>
                <BarChart3 size={20} fill="currentColor" />
                Spending Horizon Forecast
                <InfoTooltip content="Projected spending over the next 3, 6, or 12 months based on current subscriptions" />
              </h3>
              <div className="chart-controls">
                {[3, 6, 12].map(period => (
                  <button
                    key={period}
                    className={`chart-control-btn ${forecastPeriod === period ? 'active' : ''}`}
                    onClick={() => setForecastPeriod(period as 3 | 6 | 12)}
                  >
                    {period}M
                  </button>
                ))}
              </div>
            </div>
            <div className="chart-wrapper">
              <SpendingForecastChart 
                subscriptions={state.subscriptions.filter(sub => !sub.archived)}
                months={forecastPeriod}
              />
            </div>
          </div>

          <div className="chart-container">
            <div className="chart-header">
              <h3>
                <Calendar size={20} fill="currentColor" />
                Renewal Calendar
                <InfoTooltip content="Calendar heatmap showing renewal density - darker colors indicate more renewals on that date" />
              </h3>
            </div>
            <div className="chart-wrapper">
              <RenewalCalendar 
                renewalData={analytics.renewalCalendar}
                subscriptions={state.subscriptions.filter(sub => !sub.archived)}
              />
            </div>
          </div>
        </div>

        {/* Spending by Category */}
        <div className="charts-grid">
          <div className="chart-container">
            <div className="chart-header">
              <h3>
                <BarChart3 size={20} fill="currentColor" />
                Spending by Folder
                <InfoTooltip content="Monthly spending breakdown organized by folder categories" />
              </h3>
            </div>
            <div className="chart-wrapper">
              <PieChart data={analytics.spendingByFolder} />
            </div>
          </div>

          <div className="chart-container">
            <div className="chart-header">
              <h3>
                <BarChart3 size={20} fill="currentColor" />
                Spending by Tags
                <InfoTooltip content="Monthly spending breakdown organized by subscription tags" />
              </h3>
            </div>
            <div className="chart-wrapper">
              <PieChart data={analytics.spendingByTag} />
            </div>
          </div>
        </div>

        {/* Lifetime Value Projections */}
        <div className="chart-container">
          <div className="chart-header">
            <h3>
              <DollarSign size={20} fill="currentColor" />
              Lifetime Value Projections
              <InfoTooltip content="Projected total cost per subscription over a 10-year period, helping identify most expensive long-term commitments" />
            </h3>
          </div>
          <div className="lifetime-projections">
            {analytics.lifetimeProjections.map((projection, index) => (
              <div key={projection.name} className="projection-item">
                <div className="projection-rank">{index + 1}</div>
                <div className="projection-content">
                  <div className="projection-name">{projection.name}</div>
                  <div className="projection-subtitle">
                    ${projection.monthlyAmount.toFixed(2)}/month
                  </div>
                </div>
                <div className="projection-value">
                  <div className="projection-amount">
                    ${projection.tenYearProjection.toFixed(2)}
                  </div>
                  <div className="projection-period">10 years</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Savings Simulation */}
        <div className="chart-container">
          <div className="chart-header">
            <h3>
              <TrendingUp size={20} fill="currentColor" />
              Savings Simulation Engine
              <InfoTooltip content="What-if scenarios showing potential annual savings if you cancel specific subscriptions" />
            </h3>
          </div>
          <div className="savings-simulation">
            {analytics.savingsSimulation.map((simulation, index) => (
              <div key={simulation.name} className="simulation-item">
                <div className="simulation-content">
                  <div className="simulation-name">{simulation.name}</div>
                  <div className="simulation-monthly">
                    ${simulation.monthlyAmount.toFixed(2)}/month
                  </div>
                </div>
                <div className="simulation-savings">
                  <div className="savings-amount">
                    ${simulation.annualSavings.toFixed(2)}
                  </div>
                  <div className="savings-label">annual savings</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}