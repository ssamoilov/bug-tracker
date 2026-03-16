import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../UI/Card';
import { Avatar } from '../UI/Avatar';
import { Task } from '../../types';
import { MOCK_USERS } from '../../utils/constants';
import { Trophy, Award, Medal } from 'lucide-react';

interface LeaderBoardProps {
  tasks: Task[];
}

export const LeaderBoard: React.FC<LeaderBoardProps> = ({ tasks }) => {
  const leaderboard = useMemo(() => {
    const stats = new Map<string, { completed: number; inProgress: number; total: number }>();

    tasks.forEach(task => {
      if (task.assigneeId) {
        const userStats = stats.get(task.assigneeId) || { completed: 0, inProgress: 0, total: 0 };
        
        if (task.status === 'done') {
          userStats.completed++;
        } else if (task.status === 'in-progress') {
          userStats.inProgress++;
        }
        userStats.total++;
        
        stats.set(task.assigneeId, userStats);
      }
    });

    return Array.from(stats.entries())
      .map(([userId, userStats]) => ({
        user: MOCK_USERS.find(u => u.id === userId) || { id: userId, name: 'Неизвестно', initials: '??' },
        ...userStats,
      }))
      .sort((a, b) => b.completed - a.completed)
      .slice(0, 5);
  }, [tasks]);

  const getMedal = (index: number) => {
    switch (index) {
      case 0: return <Trophy className="w-5 h-5 text-yellow-400" />;
      case 1: return <Award className="w-5 h-5 text-gray-400" />;
      case 2: return <Medal className="w-5 h-5 text-amber-600" />;
      default: return <span className="w-5 h-5 flex items-center justify-center text-sm">{index + 1}</span>;
    }
  };

  return (
    <Card variant="glass">
      <CardHeader>
        <CardTitle>Лидеры по выполненным задачам</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {leaderboard.map((item, index) => (
            <div key={item.user.id} className="flex items-center gap-4">
              <div className="w-8 flex justify-center">
                {getMedal(index)}
              </div>
              
              <Avatar initials={item.user.initials} size="md" />
              
              <div className="flex-1">
                <p className="font-medium text-foreground">{item.user.name}</p>
                <p className="text-xs text-muted-foreground">
                  {item.completed} выполнено • {item.inProgress} в работе
                </p>
              </div>
              
              <div className="text-right">
                <div className="text-lg font-bold text-foreground">{item.completed}</div>
                <div className="text-xs text-muted-foreground">задач</div>
              </div>
            </div>
          ))}

          {leaderboard.length === 0 && (
            <p className="text-center text-muted-foreground py-8">
              Нет данных для отображения
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};