import React, { useMemo } from 'react';
import { Task } from '../../types';
import { MetricsCards } from './MetricsCards';
import { PieChart } from './PieChart';
import { BarChart } from './BarChart';
import { ActivityChart } from './ActivityChart';
import { LeaderBoard } from './LeaderBoard';
import { STATUSES } from '../../utils/constants';

interface StatisticsDashboardProps {
  tasks: Task[];
}

export const StatisticsDashboard: React.FC<StatisticsDashboardProps> = ({ tasks }) => {
  const metrics = useMemo(() => {
    const total = tasks.length;
    const inProgress = tasks.filter(t => t.status === 'in-progress').length;
    const completed = tasks.filter(t => t.status === 'done').length;
    const failed = tasks.filter(t => t.status === 'failed').length;

    const byPriority = {
      critical: tasks.filter(t => t.priority === 'critical').length,
      high: tasks.filter(t => t.priority === 'high').length,
      medium: tasks.filter(t => t.priority === 'medium').length,
      low: tasks.filter(t => t.priority === 'low').length,
    };

    const byStatus = {
      todo: tasks.filter(t => t.status === 'todo').length,
      'in-progress': tasks.filter(t => t.status === 'in-progress').length,
      testing: tasks.filter(t => t.status === 'testing').length,
      done: tasks.filter(t => t.status === 'done').length,
      failed: tasks.filter(t => t.status === 'failed').length,
    };

    return { total, inProgress, completed, failed, byPriority, byStatus };
  }, [tasks]);

  const statusData = Object.entries(metrics.byStatus).map(([name, value]) => ({
    name: STATUSES[name as keyof typeof STATUSES]?.title || name,
    value,
    color: STATUSES[name as keyof typeof STATUSES]?.color || '#888',
  }));

  const priorityData = Object.entries(metrics.byPriority).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value,
  }));

  return (
    <div className="p-6 space-y-6">
      {/* Метрики */}
      <MetricsCards metrics={metrics} />

      {/* Графики */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PieChart data={statusData} title="Распределение по статусам" />
        <BarChart data={priorityData} title="Распределение по приоритетам" />
      </div>

      {/* Активность */}
      <ActivityChart tasks={tasks} />

      {/* Лидеры */}
      <LeaderBoard tasks={tasks} />
    </div>
  );
};