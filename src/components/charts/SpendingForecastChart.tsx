import React, { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Subscription } from '../../types';
import { getNextOccurrence } from '../../utils/dateUtils';

interface SpendingForecastChartProps {
  subscriptions: Subscription[];
  months: number;
}

export default function SpendingForecastChart({ subscriptions, months }: SpendingForecastChartProps) {
  const forecastData = useMemo(() => {
    const data = [];
    const today = new Date();
    let cumulativeTotal = 0;

    for (let i = 0; i < months; i++) {
      const monthStart = new Date(today.getFullYear(), today.getMonth() + i, 1);
      const monthEnd = new Date(today.getFullYear(), today.getMonth() + i + 1, 0);
      
      let monthSpending = 0;
      
      subscriptions.forEach(sub => {
        let currentDate = getNextOccurrence(sub.dueDate, sub.repeat);
        
        // Count occurrences in this month
        while (currentDate <= monthEnd) {
          if (currentDate >= monthStart) {
            monthSpending += sub.amount;
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
      
      cumulativeTotal += monthSpending;
      
      data.push({
        month: monthStart.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        monthly: monthSpending,
        cumulative: cumulativeTotal
      });
    }

    return data;
  }, [subscriptions, months]);

  return (
    <ResponsiveContainer width="100%" height={250}>
      <AreaChart data={forecastData}>
        <defs>
          <linearGradient id="colorCumulative" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="var(--accent-primary)" stopOpacity={0.3}/>
            <stop offset="95%" stopColor="var(--accent-primary)" stopOpacity={0}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
        <XAxis 
          dataKey="month" 
          stroke="var(--text-secondary)"
          fontSize={12}
        />
        <YAxis 
          stroke="var(--text-secondary)"
          fontSize={12}
          tickFormatter={(value) => `$${value}`}
        />
        <Tooltip 
          contentStyle={{
            backgroundColor: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
            borderRadius: '8px',
            color: 'var(--text-primary)'
          }}
          formatter={(value: number, name: string) => [
            `$${value.toFixed(2)}`, 
            name === 'monthly' ? 'Monthly' : 'Cumulative'
          ]}
        />
        <Area
          type="monotone"
          dataKey="cumulative"
          stroke="var(--accent-primary)"
          fillOpacity={1}
          fill="url(#colorCumulative)"
          strokeWidth={2}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}