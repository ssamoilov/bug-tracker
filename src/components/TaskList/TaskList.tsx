import React, { useState, useMemo } from 'react';
import { Task, Status, Priority } from '../../types';
import { Badge } from '../UI/Badge';
import { Avatar } from '../UI/Avatar';
import { SearchInput } from '../UI/SearchInput';
import { Button } from '../UI/Button';
import { PRIORITIES, STATUSES } from '../../utils/constants';
import { formatShortDate } from '../../utils/dateUtils';
import { 
  ChevronUp, 
  ChevronDown, 
  Filter, 
  Download,
  Eye,
  Edit2
} from 'lucide-react';

interface TaskListProps {
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  onTaskEdit: (task: Task) => void;
}

type SortField = 'id' | 'title' | 'status' | 'priority' | 'createdAt';
type SortDirection = 'asc' | 'desc';

export const TaskList: React.FC<TaskListProps> = ({ tasks, onTaskClick, onTaskEdit }) => {
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [statusFilter, setStatusFilter] = useState<Status | 'all'>('all');
  const [priorityFilter, setPriorityFilter] = useState<Priority | 'all'>('all');
  const [showFilters, setShowFilters] = useState(false);

  const filteredAndSortedTasks = useMemo(() => {
    let filtered = tasks;

    // Поиск
    if (search) {
      const query = search.toLowerCase();
      filtered = filtered.filter(task => 
        task.title.toLowerCase().includes(query) ||
        task.id.toLowerCase().includes(query)
      );
    }

    // Фильтр по статусу
    if (statusFilter !== 'all') {
      filtered = filtered.filter(task => task.status === statusFilter);
    }

    // Фильтр по приоритету
    if (priorityFilter !== 'all') {
      filtered = filtered.filter(task => task.priority === priorityFilter);
    }

    // Сортировка
    filtered.sort((a, b) => {
      let aValue: string | number = a[sortField];
      let bValue: string | number = b[sortField];

      if (sortField === 'createdAt') {
        aValue = new Date(a.createdAt).getTime();
        bValue = new Date(b.createdAt).getTime();
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [tasks, search, sortField, sortDirection, statusFilter, priorityFilter]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const exportToCSV = () => {
    const headers = ['ID', 'Заголовок', 'Статус', 'Приоритет', 'Дата создания'];
    const csvData = filteredAndSortedTasks.map(task => [
      task.id,
      task.title,
      STATUSES[task.status].title,
      PRIORITIES[task.priority].label,
      new Date(task.createdAt).toLocaleString(),
    ]);

    const csv = [headers, ...csvData].map(row => row.join(',')).join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `tasks-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? 
      <ChevronUp className="w-4 h-4" /> : 
      <ChevronDown className="w-4 h-4" />;
  };

  const getStatusVariant = (status: Status): 'default' | 'success' | 'warning' | 'danger' | 'info' => {
    switch (status) {
      case 'done': return 'success';
      case 'failed': return 'danger';
      case 'testing': return 'warning';
      case 'in-progress': return 'info';
      default: return 'default';
    }
  };

  return (
    <div className="p-6 space-y-4">
      {/* Панель инструментов */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 flex-1">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Поиск по ID, заголовку..."
            className="max-w-md"
          />
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            icon={<Filter className="w-4 h-4" />}
          >
            Фильтры
          </Button>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={exportToCSV}
          icon={<Download className="w-4 h-4" />}
        >
          Экспорт CSV
        </Button>
      </div>

      {/* Фильтры */}
      {showFilters && (
        <div className="flex items-center gap-4 p-4 glass-dark rounded-xl animate-fade-in">
          <div className="flex-1">
            <label className="block text-sm font-medium text-foreground mb-1">
              Статус
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as Status | 'all')}
              className="w-full h-9 rounded-lg bg-secondary border border-input px-3 text-sm"
            >
              <option value="all">Все статусы</option>
              {Object.entries(STATUSES).map(([value, { title, icon }]) => (
                <option key={value} value={value}>
                  {icon} {title}
                </option>
              ))}
            </select>
          </div>

          <div className="flex-1">
            <label className="block text-sm font-medium text-foreground mb-1">
              Приоритет
            </label>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value as Priority | 'all')}
              className="w-full h-9 rounded-lg bg-secondary border border-input px-3 text-sm"
            >
              <option value="all">Все приоритеты</option>
              {Object.entries(PRIORITIES).map(([value, { label, icon }]) => (
                <option key={value} value={value}>
                  {icon} {label}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Таблица задач */}
      <div className="glass-dark rounded-xl overflow-hidden">
        <table className="w-full">
          <thead className="bg-secondary/50">
            <tr>
              <th 
                className="px-4 py-3 text-left text-sm font-medium text-muted-foreground cursor-pointer hover:text-foreground"
                onClick={() => handleSort('id')}
              >
                <div className="flex items-center gap-1">
                  ID <SortIcon field="id" />
                </div>
              </th>
              <th 
                className="px-4 py-3 text-left text-sm font-medium text-muted-foreground cursor-pointer hover:text-foreground"
                onClick={() => handleSort('title')}
              >
                <div className="flex items-center gap-1">
                  Заголовок <SortIcon field="title" />
                </div>
              </th>
              <th 
                className="px-4 py-3 text-left text-sm font-medium text-muted-foreground cursor-pointer hover:text-foreground"
                onClick={() => handleSort('status')}
              >
                <div className="flex items-center gap-1">
                  Статус <SortIcon field="status" />
                </div>
              </th>
              <th 
                className="px-4 py-3 text-left text-sm font-medium text-muted-foreground cursor-pointer hover:text-foreground"
                onClick={() => handleSort('priority')}
              >
                <div className="flex items-center gap-1">
                  Приоритет <SortIcon field="priority" />
                </div>
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                Исполнитель
              </th>
              <th 
                className="px-4 py-3 text-left text-sm font-medium text-muted-foreground cursor-pointer hover:text-foreground"
                onClick={() => handleSort('createdAt')}
              >
                <div className="flex items-center gap-1">
                  Дата <SortIcon field="createdAt" />
                </div>
              </th>
              <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">
                Действия
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filteredAndSortedTasks.map((task) => (
              <tr 
                key={task.id}
                className="hover:bg-secondary/20 transition-colors cursor-pointer"
                onClick={() => onTaskClick(task)}
              >
                <td className="px-4 py-3 font-mono text-sm">
                  {task.id}
                </td>
                <td className="px-4 py-3">
                  <div className="font-medium text-foreground line-clamp-1">
                    {task.title}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <Badge variant={getStatusVariant(task.status)}>
                    {STATUSES[task.status].icon} {STATUSES[task.status].title}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <div 
                    className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs"
                    style={{ 
                      backgroundColor: `${PRIORITIES[task.priority].color}20`,
                      color: PRIORITIES[task.priority].color 
                    }}
                  >
                    {PRIORITIES[task.priority].icon} {PRIORITIES[task.priority].label}
                  </div>
                </td>
                <td className="px-4 py-3">
                  {task.assigneeId ? (
                    <Avatar initials="АР" size="sm" />
                  ) : (
                    <span className="text-muted-foreground text-sm">—</span>
                  )}
                </td>
                <td className="px-4 py-3 text-sm text-muted-foreground">
                  {formatShortDate(task.createdAt)}
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onTaskClick(task);
                      }}
                      className="p-1.5 rounded-lg hover:bg-secondary transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onTaskEdit(task);
                      }}
                      className="p-1.5 rounded-lg hover:bg-secondary transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {filteredAndSortedTasks.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                  {search ? 'Ничего не найдено' : 'Нет задач'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Информация о количестве */}
      <div className="text-sm text-muted-foreground">
        Показано {filteredAndSortedTasks.length} из {tasks.length} задач
      </div>
    </div>
  );
};