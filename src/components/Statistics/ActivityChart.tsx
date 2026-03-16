import React, { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '../UI/Card';
import { Task } from '../../types';
import { getDaysAgo } from '../../utils/dateUtils';

interface ActivityChartProps {
  tasks: Task[];
}

export const ActivityChart: React.FC<ActivityChartProps> = ({ tasks }) => {
  const data = useMemo(() => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = getDaysAgo(6 - i);
      return {
        date: date.toISOString().split('T')[0],
        created: 0,
        completed: 0,
        display: date.toLocaleDateString('ru', { day: 'numeric', month: 'short' }),
      };
    });

    tasks.forEach(task => {
      const createdDate = new Date(task.createdAt).toISOString().split('T')[0];
      const createdIndex = last7Days.findIndex(d => d.date === createdDate);
      if (createdIndex !== -1) {
        last7Days[createdIndex].created++;
      }

      if (task.status === 'done') {
        const completedDate = new Date(task.updatedAt).toISOString().split('T')[0];
        const completedIndex = last7Days.findIndex(d => d.date === completedDate);
        if (completedIndex !== -1) {
          last7Days[completedIndex].completed++;
        }
      }
    });

    return last7Days;
  }, [tasks]);

  return (
    <Card variant="glass">
      <CardHeader>
        <CardTitle>Активность за 7 дней</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="display" stroke="#888" />
              <YAxis stroke="#888" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1A1A1A', 
                  border: '1px solid #333',
                  borderRadius: '8px',
                  color: '#fff'
                }} 
              />
              <Line type="monotone" dataKey="created" stroke="#6366F1" strokeWidth={2} name="Создано" />
              <Line type="monotone" dataKey="completed" stroke="#22C55E" strokeWidth={2} name="Завершено" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};