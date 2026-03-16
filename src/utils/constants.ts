import { Column, Priority, Status, User } from '../types';

export const STORAGE_KEYS = {
  TASKS: 'bugtracker-tasks',
  USERS: 'bugtracker-users',
  COMMENTS: 'bugtracker-comments',
  ATTACHMENTS: 'bugtracker-attachments',
  SETTINGS: 'bugtracker-settings',
} as const;

export const STATUSES: Record<Status, Column> = {
  todo: {
    id: 'todo',
    title: 'To Do',
    icon: '📥',
    color: '#6B7280',
    gradient: 'gradient-todo',
  },
  'in-progress': {
    id: 'in-progress',
    title: 'In Progress',
    icon: '⚙️',
    color: '#3B82F6',
    gradient: 'gradient-progress',
  },
  testing: {
    id: 'testing',
    title: 'Testing',
    icon: '🧪',
    color: '#F97316',
    gradient: 'gradient-testing',
  },
  done: {
    id: 'done',
    title: 'Done',
    icon: '✅',
    color: '#22C55E',
    gradient: 'gradient-done',
  },
  failed: {
    id: 'failed',
    title: 'Failed',
    icon: '❌',
    color: '#EF4444',
    gradient: 'gradient-failed',
  },
};

export const PRIORITIES: Record<Priority, { label: string; color: string; icon: string }> = {
  critical: { label: 'Critical', color: '#DC2626', icon: '🔴' },
  high: { label: 'High', color: '#F97316', icon: '🟠' },
  medium: { label: 'Medium', color: '#EAB308', icon: '🟡' },
  low: { label: 'Low', color: '#3B82F6', icon: '🔵' },
};

export const MOCK_USERS: User[] = [
  {
    id: 'alex-dev',
    name: 'Алексей Разработчик',
    email: 'alex@company.com',
    role: 'developer',
    initials: 'АР',
  },
  {
    id: 'maria-tester',
    name: 'Мария Тестировщик',
    email: 'maria@company.com',
    role: 'tester',
    initials: 'МТ',
  },
  {
    id: 'dmitry-lead',
    name: 'Дмитрий Team Lead',
    email: 'dmitry@company.com',
    role: 'teamlead',
    initials: 'ДК',
  },
  {
    id: 'elena-designer',
    name: 'Елена Дизайнер',
    email: 'elena@company.com',
    role: 'designer',
    initials: 'ЕС',
  },
];

export const COLUMN_ORDER: Status[] = ['todo', 'in-progress', 'testing', 'done', 'failed'];

export const DEFAULT_SETTINGS = {
  theme: 'dark' as const,
  animations: true,
  columnOrder: COLUMN_ORDER,
  taskDensity: 'comfortable' as const,
};

export const HOTKEYS = {
  SEARCH: 'mod+k',
  NEW_TASK: 'mod+n',
  TAB_BOARD: 'mod+1',
  TAB_LIST: 'mod+2',
  TAB_STATS: 'mod+3',
  CLOSE_MODAL: 'escape',
} as const;