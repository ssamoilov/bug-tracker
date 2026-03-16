import React from 'react';
import { PieChart as RePieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '../UI/Card';

interface PieChartProps {
  data: Array<{
    name: string;
    value: number;
    color?: string;
  }>;
  title: string;
}

export const PieChart: React.FC<PieChartProps> = ({ data, title }) => {
  const COLORS = ['#6366F1', '#A855F7', '#EC4899', '#EF4444', '#F97316'];

  // Фильтруем данные с нулевыми значениями
  const filteredData = data.filter(item => item.value > 0);

  return (
    <Card variant="glass">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <RePieChart>
              <Pie
                data={filteredData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => {
                  if (!percent) return name;
                  return `${name} ${(percent * 100).toFixed(0)}%`;
                }}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {filteredData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1A1A1A', 
                  border: '1px solid #333',
                  borderRadius: '8px',
                  color: '#fff'
                }} 
              />
              <Legend />
            </RePieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};