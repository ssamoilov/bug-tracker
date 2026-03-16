import React from 'react';
import { Card, CardContent } from '../UI/Card';
import { Activity, CheckCircle, XCircle, Clock } from 'lucide-react';

interface MetricsCardsProps {
  metrics: {
    total: number;
    inProgress: number;
    completed: number;
    failed: number;
  };
}

export const MetricsCards: React.FC<MetricsCardsProps> = ({ metrics }) => {
  const cards = [
    {
      title: 'Всего задач',
      value: metrics.total,
      icon: Activity,
      color: 'text-blue-400',
      bg: 'bg-blue-500/10',
    },
    {
      title: 'В работе',
      value: metrics.inProgress,
      icon: Clock,
      color: 'text-yellow-400',
      bg: 'bg-yellow-500/10',
    },
    {
      title: 'Готово',
      value: metrics.completed,
      icon: CheckCircle,
      color: 'text-green-400',
      bg: 'bg-green-500/10',
    },
    {
      title: 'Провалено',
      value: metrics.failed,
      icon: XCircle,
      color: 'text-red-400',
      bg: 'bg-red-500/10',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <Card key={card.title} variant="glass" className="hover:scale-105 transition-transform">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">{card.title}</p>
                  <p className="text-3xl font-bold text-foreground">{card.value}</p>
                </div>
                <div className={cn('p-3 rounded-xl', card.bg)}>
                  <Icon className={cn('w-6 h-6', card.color)} />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

// Импортируем cn, если его нет
import { cn } from '../../utils/cn';