import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ChartDataPoint } from '../../types';

interface SpendingTrendsChartProps {
  data: ChartDataPoint[];
}

export default function SpendingTrendsChart({ data }: SpendingTrendsChartProps) {
  return (
    <ResponsiveContainer width="100%" height={250}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
        <XAxis 
          dataKey="date" 
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
          formatter={(value: number) => [`$${value.toFixed(2)}`, 'Amount']}
        />
        <Line 
          type="monotone" 
          dataKey="amount" 
          stroke="var(--accent-primary)" 
          strokeWidth={3}
          dot={{ fill: 'var(--accent-primary)', strokeWidth: 2, r: 4 }}
          activeDot={{ r: 6, stroke: 'var(--accent-primary)', strokeWidth: 2 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}