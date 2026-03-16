import React, { useState } from 'react';
import { Modal } from '../UI/Modal';
import { Button } from '../UI/Button';
import { Avatar } from '../UI/Avatar';
import { Badge } from '../UI/Badge';
import { Input } from '../UI/Input';
import { ImageSlider } from '../UI/ImageSlider';
import { FileUpload } from '../UI/FileUpload';
import { Task } from '../../types';
import { STATUSES, PRIORITIES, MOCK_USERS } from '../../utils/constants';
import { formatDate } from '../../utils/dateUtils';
import { 
  Paperclip, 
  Calendar, 
  Edit2,
  Trash2,
  Download,
  AlertCircle,
  CheckCircle,
  XCircle,
  Info,
  Clock,
  GitBranch,
  Package,
  Save,
  X,
  Plus
} from 'lucide-react';

interface TaskDetailModalProps {
  task: Task;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (taskId: string, updates: Partial<Task>) => Promise<void>;
  onDelete: (taskId: string) => Promise<void>;
}

interface BugReportDetails {
  summary: string;
  description: string;
  stepsToReproduce: string;
  expectedResult: string;
  actualResult: string;
  severity: string;
  environment?: string;
  buildVersion?: string;
}

export const TaskDetailModal: React.FC<TaskDetailModalProps> = ({
  task,
  isOpen,
  onClose,
  onUpdate,
  onDelete,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [sliderOpen, setSliderOpen] = useState(false);
  const [sliderIndex, setSliderIndex] = useState(0);
  const [showFileUpload, setShowFileUpload] = useState(false);
  
  // Парсим детали баг-репорта из description
  const bugDetails = React.useMemo(() => {
    try {
      const parsed = JSON.parse(task.description);
      return {
        summary: parsed.summary || task.title,
        description: parsed.description || '',
        stepsToReproduce: parsed.stepsToReproduce || '',
        expectedResult: parsed.expectedResult || '',
        actualResult: parsed.actualResult || '',
        severity: parsed.severity || task.severity || 'major',
        environment: parsed.environment || task.environment || 'Не указано',
        buildVersion: parsed.buildVersion || task.buildVersion || 'Не указано',
      };
    } catch (e) {
      return {
        summary: task.title,
        description: task.description,
        stepsToReproduce: '',
        expectedResult: '',
        actualResult: '',
        severity: task.severity || 'major',
        environment: task.environment || 'Не указано',
        buildVersion: task.buildVersion || 'Не указано',
      };
    }
  }, [task]);

  // Состояния для всех полей
  const [editedFields, setEditedFields] = useState<BugReportDetails>(bugDetails);
  const [selectedStatus, setSelectedStatus] = useState(task.status);
  const [selectedPriority, setSelectedPriority] = useState(task.priority);
  const [selectedAssignee, setSelectedAssignee] = useState(task.assigneeId);
  const [existingAttachments, setExistingAttachments] = useState(task.attachments);
  const [newAttachments, setNewAttachments] = useState<any[]>([]);

  const handleUpdateTask = async () => {
    const updatedDescription = JSON.stringify({
      ...editedFields,
      severity: editedFields.severity,
    });

    await onUpdate(task.id, {
      title: editedFields.summary,
      description: updatedDescription,
      status: selectedStatus,
      priority: selectedPriority,
      severity: editedFields.severity as any,
      assigneeId: selectedAssignee,
      attachments: [...existingAttachments, ...newAttachments],
      environment: editedFields.environment,
      buildVersion: editedFields.buildVersion,
    });
    setIsEditing(false);
    setNewAttachments([]);
    setShowFileUpload(false);
  };

  const handleCancelEdit = () => {
    setEditedFields(bugDetails);
    setSelectedStatus(task.status);
    setSelectedPriority(task.priority);
    setSelectedAssignee(task.assigneeId);
    setExistingAttachments(task.attachments);
    setNewAttachments([]);
    setShowFileUpload(false);
    setIsEditing(false);
  };

  const handleFilesSelected = (files: any[]) => {
    setNewAttachments(prev => [...prev, ...files]);
    setShowFileUpload(false);
  };

  const removeAttachment = (index: number, isExisting: boolean) => {
    if (isExisting) {
      setExistingAttachments(prev => prev.filter((_, i) => i !== index));
    } else {
      setNewAttachments(prev => prev.filter((_, i) => i !== index));
    }
  };

  const openSlider = (index: number) => {
    setSliderIndex(index);
    setSliderOpen(true);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-500 bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-900';
      case 'major': return 'text-orange-500 bg-orange-50 dark:bg-orange-500/10 border-orange-200 dark:border-orange-900';
      case 'minor': return 'text-yellow-500 bg-yellow-50 dark:bg-yellow-500/10 border-yellow-200 dark:border-yellow-900';
      case 'trivial': return 'text-blue-500 bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-900';
      default: return 'text-gray-500 bg-gray-50 dark:bg-gray-500/10 border-gray-200 dark:border-gray-900';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <XCircle className="w-5 h-5" />;
      case 'major': return <AlertCircle className="w-5 h-5" />;
      case 'minor': return <Info className="w-5 h-5" />;
      case 'trivial': return <CheckCircle className="w-5 h-5" />;
      default: return <Info className="w-5 h-5" />;
    }
  };

  const getUserName = (userId?: string) => {
    if (!userId) return 'Не назначен';
    const user = MOCK_USERS.find(u => u.id === userId);
    return user ? user.name : 'Неизвестно';
  };

  const getUserInitials = (userId?: string) => {
    if (!userId) return '?';
    const user = MOCK_USERS.find(u => u.id === userId);
    return user ? user.initials : '?';
  };

  // Все вложения вместе для отображения
  const allAttachments = [...existingAttachments, ...newAttachments];

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      {/* Хедер с ID */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-lg">BUG</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm text-gray-500 dark:text-gray-400">
                {task.id}
              </span>
              {!isEditing && (
                <Badge variant={getStatusVariant(task.status)}>
                  {STATUSES[task.status].icon} {STATUSES[task.status].title}
                </Badge>
              )}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Создано {formatDate(task.createdAt)}
            </p>
          </div>
        </div>
        
        {!isEditing ? (
          <Button
            onClick={() => setIsEditing(true)}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-lg hover:shadow-blue-500/25"
            icon={<Edit2 className="w-4 h-4" />}
          >
            Редактировать
          </Button>
        ) : (
          <div className="flex items-center gap-2">
            <Button
              onClick={handleUpdateTask}
              className="bg-gradient-to-r from-green-600 to-emerald-600 text-white"
              icon={<Save className="w-4 h-4" />}
            >
              Сохранить
            </Button>
            <Button
              variant="outline"
              onClick={handleCancelEdit}
              icon={<X className="w-4 h-4" />}
            >
              Отмена
            </Button>
          </div>
        )}
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Левая колонка - основная информация */}
        <div className="flex-1 space-y-6">
          {isEditing ? (
            // РЕЖИМ РЕДАКТИРОВАНИЯ - все поля доступны
            <div className="space-y-4">
              {/* Summary */}
              <div className="bg-white dark:bg-[#1e1e1e] rounded-xl p-6 border border-gray-200 dark:border-gray-800">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Summary <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={editedFields.summary}
                  onChange={(e) => setEditedFields({...editedFields, summary: e.target.value})}
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Краткое описание проблемы"
                />
              </div>

              {/* Description */}
              <div className="bg-white dark:bg-[#1e1e1e] rounded-xl p-6 border border-gray-200 dark:border-gray-800">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={editedFields.description}
                  onChange={(e) => setEditedFields({...editedFields, description: e.target.value})}
                  rows={4}
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Подробное описание проблемы..."
                />
              </div>

              {/* Steps to Reproduce */}
              <div className="bg-white dark:bg-[#1e1e1e] rounded-xl p-6 border border-gray-200 dark:border-gray-800">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Steps to Reproduce
                </label>
                <textarea
                  value={editedFields.stepsToReproduce}
                  onChange={(e) => setEditedFields({...editedFields, stepsToReproduce: e.target.value})}
                  rows={5}
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="1. ...&#10;2. ...&#10;3. ..."
                />
              </div>

              {/* Expected vs Actual */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white dark:bg-[#1e1e1e] rounded-xl p-6 border border-green-200 dark:border-green-900">
                  <label className="block text-sm font-medium text-green-600 dark:text-green-400 mb-2">
                    Expected Result
                  </label>
                  <textarea
                    value={editedFields.expectedResult}
                    onChange={(e) => setEditedFields({...editedFields, expectedResult: e.target.value})}
                    rows={3}
                    className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Как должно работать..."
                  />
                </div>

                <div className="bg-white dark:bg-[#1e1e1e] rounded-xl p-6 border border-red-200 dark:border-red-900">
                  <label className="block text-sm font-medium text-red-600 dark:text-red-400 mb-2">
                    Actual Result
                  </label>
                  <textarea
                    value={editedFields.actualResult}
                    onChange={(e) => setEditedFields({...editedFields, actualResult: e.target.value})}
                    rows={3}
                    className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="Что происходит сейчас..."
                  />
                </div>
              </div>

              {/* Environment и Build Version */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white dark:bg-[#1e1e1e] rounded-xl p-6 border border-gray-200 dark:border-gray-800">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-1">
                    <GitBranch className="w-4 h-4" /> Environment
                  </label>
                  <input
                    type="text"
                    value={editedFields.environment}
                    onChange={(e) => setEditedFields({...editedFields, environment: e.target.value})}
                    className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="production/staging/development"
                  />
                </div>

                <div className="bg-white dark:bg-[#1e1e1e] rounded-xl p-6 border border-gray-200 dark:border-gray-800">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-1">
                    <Package className="w-4 h-4" /> Build Version
                  </label>
                  <input
                    type="text"
                    value={editedFields.buildVersion}
                    onChange={(e) => setEditedFields({...editedFields, buildVersion: e.target.value})}
                    className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="v1.0.0"
                  />
                </div>
              </div>
            </div>
          ) : (
            // РЕЖИМ ПРОСМОТРА
            <>
              {/* Summary с severity */}
              <div className={`p-6 rounded-xl border ${getSeverityColor(bugDetails.severity)}`}>
                <div className="flex items-start gap-3">
                  <div className={getSeverityColor(bugDetails.severity).split(' ')[0]}>
                    {getSeverityIcon(bugDetails.severity)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm font-medium capitalize">
                        {bugDetails.severity} severity
                      </span>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                      {bugDetails.summary}
                    </h1>
                  </div>
                </div>
              </div>

              {/* Description */}
              {bugDetails.description && (
                <div className="bg-white dark:bg-[#1e1e1e] rounded-xl p-6 border border-gray-200 dark:border-gray-800">
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3 flex items-center gap-2">
                    <Info className="w-4 h-4" />
                    Description
                  </h3>
                  <p className="text-gray-900 dark:text-gray-100 whitespace-pre-wrap leading-relaxed">
                    {bugDetails.description}
                  </p>
                </div>
              )}

              {/* Steps to Reproduce */}
              {bugDetails.stepsToReproduce && (
                <div className="bg-white dark:bg-[#1e1e1e] rounded-xl p-6 border border-gray-200 dark:border-gray-800">
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3 flex items-center gap-2">
                    <span>📋</span>
                    Steps to Reproduce
                  </h3>
                  <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 font-mono text-sm whitespace-pre-wrap border border-gray-200 dark:border-gray-800">
                    {bugDetails.stepsToReproduce}
                  </div>
                </div>
              )}

              {/* Expected vs Actual */}
              {(bugDetails.expectedResult || bugDetails.actualResult) && (
                <div className="grid grid-cols-2 gap-4">
                  {bugDetails.expectedResult && (
                    <div className="bg-white dark:bg-[#1e1e1e] rounded-xl p-6 border border-green-200 dark:border-green-900">
                      <h3 className="text-sm font-medium text-green-600 dark:text-green-400 mb-3 flex items-center gap-2">
                        <CheckCircle className="w-4 h-4" />
                        Expected Result
                      </h3>
                      <p className="text-sm text-gray-900 dark:text-gray-100 whitespace-pre-wrap">
                        {bugDetails.expectedResult}
                      </p>
                    </div>
                  )}

                  {bugDetails.actualResult && (
                    <div className="bg-white dark:bg-[#1e1e1e] rounded-xl p-6 border border-red-200 dark:border-red-900">
                      <h3 className="text-sm font-medium text-red-600 dark:text-red-400 mb-3 flex items-center gap-2">
                        <XCircle className="w-4 h-4" />
                        Actual Result
                      </h3>
                      <p className="text-sm text-gray-900 dark:text-gray-100 whitespace-pre-wrap">
                        {bugDetails.actualResult}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Environment info */}
              {(bugDetails.environment || bugDetails.buildVersion) && (
                <div className="bg-white dark:bg-[#1e1e1e] rounded-xl p-4 border border-gray-200 dark:border-gray-800 flex items-center gap-4 text-sm">
                  {bugDetails.environment && (
                    <div className="flex items-center gap-1">
                      <GitBranch className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-700 dark:text-gray-300">{bugDetails.environment}</span>
                    </div>
                  )}
                  {bugDetails.buildVersion && (
                    <div className="flex items-center gap-1">
                      <Package className="w-4 h-4 text-gray-400" />
                      <span className="font-mono text-gray-700 dark:text-gray-300">{bugDetails.buildVersion}</span>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Правая колонка - детали */}
        <div className="lg:w-80 space-y-4">
          {/* Блок с деталями */}
          <div className="bg-white dark:bg-[#1e1e1e] rounded-xl p-6 border border-gray-200 dark:border-gray-800 shadow-sm">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <div className="w-1 h-5 bg-gradient-to-b from-blue-600 to-purple-600 rounded-full" />
              Детали задачи
            </h3>
            
            <div className="space-y-4">
              {/* Severity */}
              <div>
                <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">Серьезность</label>
                {isEditing ? (
                  <select
                    value={editedFields.severity}
                    onChange={(e) => setEditedFields({...editedFields, severity: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="critical">🔴 Critical</option>
                    <option value="major">🟠 Major</option>
                    <option value="minor">🟡 Minor</option>
                    <option value="trivial">🔵 Trivial</option>
                  </select>
                ) : (
                  <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
                    <div className={`w-2 h-2 rounded-full ${
                      bugDetails.severity === 'critical' ? 'bg-red-500' :
                      bugDetails.severity === 'major' ? 'bg-orange-500' :
                      bugDetails.severity === 'minor' ? 'bg-yellow-500' :
                      'bg-blue-500'
                    }`} />
                    <span className="text-sm text-gray-900 dark:text-white capitalize">{bugDetails.severity}</span>
                  </div>
                )}
              </div>

              {/* Priority */}
              <div>
                <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">Приоритет</label>
                {isEditing ? (
                  <select
                    value={selectedPriority}
                    onChange={(e) => setSelectedPriority(e.target.value as any)}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                  >
                    {Object.entries(PRIORITIES).map(([key, { label, icon }]) => (
                      <option key={key} value={key}>{icon} {label}</option>
                    ))}
                  </select>
                ) : (
                  <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
                    <div 
                      className="w-2 h-2 rounded-full" 
                      style={{ backgroundColor: PRIORITIES[task.priority].color }}
                    />
                    <span className="text-sm text-gray-900 dark:text-white">
                      {PRIORITIES[task.priority].icon} {PRIORITIES[task.priority].label}
                    </span>
                  </div>
                )}
              </div>

              {/* Status */}
              <div>
                <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">Статус</label>
                {isEditing ? (
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value as any)}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                  >
                    {Object.entries(STATUSES).map(([key, { title, icon }]) => (
                      <option key={key} value={key}>{icon} {title}</option>
                    ))}
                  </select>
                ) : (
                  <div className="px-3 py-2 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
                    <Badge variant={getStatusVariant(task.status)}>
                      {STATUSES[task.status].icon} {STATUSES[task.status].title}
                    </Badge>
                  </div>
                )}
              </div>

              {/* Assignee */}
              <div>
                <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">Исполнитель</label>
                {isEditing ? (
                  <select
                    value={selectedAssignee || ''}
                    onChange={(e) => setSelectedAssignee(e.target.value || undefined)}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Не назначен</option>
                    {MOCK_USERS.map(user => (
                      <option key={user.id} value={user.id}>{user.name}</option>
                    ))}
                  </select>
                ) : (
                  <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
                    {task.assigneeId ? (
                      <>
                        <Avatar initials={getUserInitials(task.assigneeId)} size="sm" />
                        <span className="text-sm text-gray-900 dark:text-white">{getUserName(task.assigneeId)}</span>
                      </>
                    ) : (
                      <span className="text-sm text-gray-500">Не назначен</span>
                    )}
                  </div>
                )}
              </div>

              {/* Created at - только для просмотра */}
              <div>
                <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">Создано</label>
                <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 text-sm">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-900 dark:text-white">{formatDate(task.createdAt)}</span>
                </div>
              </div>

              {/* Updated at - только для просмотра */}
              <div>
                <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">Обновлено</label>
                <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 text-sm">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-900 dark:text-white">{formatDate(task.updatedAt)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Вложения */}
          <div className="bg-white dark:bg-[#1e1e1e] rounded-xl p-6 border border-gray-200 dark:border-gray-800 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <Paperclip className="w-4 h-4" />
                Вложения ({allAttachments.length})
              </h3>
              
              {isEditing && !showFileUpload && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowFileUpload(true)}
                  icon={<Plus className="w-4 h-4" />}
                >
                  Добавить
                </Button>
              )}
            </div>
            
            {showFileUpload && (
              <div className="mb-4">
                <FileUpload
                  onFilesSelected={handleFilesSelected}
                  maxFiles={10}
                  maxSize={10 * 1024 * 1024}
                />
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setShowFileUpload(false)}
                  className="mt-2"
                >
                  Отмена
                </Button>
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-2">
              {allAttachments.map((attachment, index) => {
                const isExisting = index < existingAttachments.length;
                return (
                  <div 
                    key={attachment.id} 
                    className="relative group cursor-pointer rounded-lg overflow-hidden border border-gray-200 dark:border-gray-800 hover:border-blue-500 transition-colors"
                    onClick={() => {
                      if (attachment.type.startsWith('image/')) {
                        openSlider(index);
                      } else {
                        window.open(attachment.data);
                      }
                    }}
                  >
                    {attachment.type.startsWith('image/') ? (
                      <>
                        <img
                          src={attachment.thumbnail || attachment.data}
                          alt={attachment.name}
                          className="w-full h-20 object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      </>
                    ) : (
                      <div className="w-full h-20 bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center">
                        <span className="text-2xl mb-1">📄</span>
                        <span className="text-xs text-gray-500 truncate max-w-full px-2">
                          {attachment.name}
                        </span>
                      </div>
                    )}
                    
                    <div className="absolute top-1 right-1 flex gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(attachment.data);
                        }}
                        className="p-1.5 rounded-lg bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                      
                      {isEditing && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeAttachment(index, isExisting);
                          }}
                          className="p-1.5 rounded-lg bg-red-500/80 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    {!isExisting && (
                      <div className="absolute bottom-1 left-1 px-1 py-0.5 bg-green-500/80 text-white text-[8px] rounded">
                        NEW
                      </div>
                    )}
                  </div>
                );
              })}

              {allAttachments.length === 0 && !showFileUpload && (
                <div className="col-span-2 py-8 text-center text-gray-500 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
                  <Paperclip className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Нет вложений</p>
                  {isEditing && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setShowFileUpload(true)}
                      className="mt-2"
                    >
                      Добавить файлы
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <ImageSlider
        images={allAttachments
          .filter(att => att.type.startsWith('image/'))
          .map(att => ({
            id: att.id,
            url: att.data,
            name: att.name,
          }))}
        initialIndex={sliderIndex}
        isOpen={sliderOpen}
        onClose={() => setSliderOpen(false)}
      />
    </Modal>
  );
};

function getStatusVariant(status: string): 'default' | 'success' | 'warning' | 'danger' | 'info' {
  switch (status) {
    case 'done': return 'success';
    case 'failed': return 'danger';
    case 'testing': return 'warning';
    case 'in-progress': return 'info';
    default: return 'default';
  }
}