import React from 'react';
import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface PieChartProps {
  data: Array<{
    name: string;
    amount: number;
    color: string;
  }>;
}

export default function PieChart({ data }: PieChartProps) {
  if (data.length === 0) {
    return (
      <div className="empty-chart">
        <p>No data available</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={250}>
      <RechartsPieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={40}
          outerRadius={80}
          paddingAngle={2}
          dataKey="amount"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip 
          contentStyle={{
            backgroundColor: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
            borderRadius: '8px',
            color: 'var(--text-primary)'
          }}
          formatter={(value: number) => [`$${value.toFixed(2)}`, 'Amount']}
        />
        <Legend 
          wrapperStyle={{
            fontSize: '12px',
            color: 'var(--text-secondary)'
          }}
        />
      </RechartsPieChart>
    </ResponsiveContainer>
  );
}