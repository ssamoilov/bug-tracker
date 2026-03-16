export type Priority = 'critical' | 'high' | 'medium' | 'low';
export type Severity = 'critical' | 'major' | 'minor' | 'trivial';
export type Status = 'todo' | 'in-progress' | 'testing' | 'done' | 'failed';
export type UserRole = 'developer' | 'tester' | 'teamlead' | 'designer';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: UserRole;
  initials: string;
}

export interface Attachment {
  id: string;
  name: string;
  type: string;
  size: number;
  data: string; // base64
  thumbnail?: string; // base64 for images
  createdAt: string;
}

export interface Comment {
  id: string;
  taskId: string;
  userId: string;
  content: string;
  createdAt: string;
  updatedAt?: string;
  attachments?: Attachment[];
}

export interface BugReportDetails {
  summary: string;
  description: string;
  stepsToReproduce: string;
  expectedResult: string;
  actualResult: string;
  severity: Severity;
  environment?: string;
  buildVersion?: string;
}

export interface Task {
  id: string;
  title: string;
  description: string; // JSON string with BugReportDetails
  status: Status;
  priority: Priority;
  severity: Severity;
  assigneeId?: string;
  reporterId: string;
  createdAt: string;
  updatedAt: string;
  attachments: Attachment[];
  commentIds: string[];
  tags?: string[];
  environment?: string; // Окружение (prod, staging, dev)
  buildVersion?: string; // Версия сборки
}

export interface Column {
  id: Status;
  title: string;
  icon: string;
  color: string;
  gradient: string;
}

export interface TaskMetrics {
  total: number;
  inProgress: number;
  completed: number;
  failed: number;
  byPriority: Record<Priority, number>;
  bySeverity: Record<Severity, number>;
  byStatus: Record<Status, number>;
  byAssignee: Record<string, number>;
}

export interface StorageSchema {
  tasks: Task[];
  users: User[];
  comments: Comment[];
  settings: {
    theme: 'dark' | 'light' | 'system';
    animations: boolean;
    columnOrder: Status[];
    taskDensity: 'comfortable' | 'compact';
  };
}