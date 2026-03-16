import React, { useState } from 'react';
import { Modal } from '../UI/Modal';
import { Button } from '../UI/Button';
import { Input } from '../UI/Input';
import { Select } from '../UI/Select';
import { FileUpload } from '../UI/FileUpload';
import { Task, Priority, Status } from '../../types';
import { PRIORITIES, MOCK_USERS, STATUSES } from '../../utils/constants';
import { X, AlertCircle, CheckCircle, Info } from 'lucide-react';

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (taskData: Partial<Task>) => Promise<void>;
  initialStatus?: Status;
}

export const CreateTaskModal: React.FC<CreateTaskModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialStatus = 'todo',
}) => {
  const [summary, setSummary] = useState('');
  const [description, setDescription] = useState('');
  const [stepsToReproduce, setStepsToReproduce] = useState('');
  const [expectedResult, setExpectedResult] = useState('');
  const [actualResult, setActualResult] = useState('');
  const [severity, setSeverity] = useState('major');
  const [priority, setPriority] = useState<Priority>('medium');
  const [status, setStatus] = useState<Status>(initialStatus);
  const [assigneeId, setAssigneeId] = useState('');
  const [attachments, setAttachments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!summary.trim()) return;

    setLoading(true);
    try {
      const fullDescription = JSON.stringify({
        summary,
        description,
        stepsToReproduce,
        expectedResult,
        actualResult,
        severity,
      });

      await onSubmit({
        title: summary,
        description: fullDescription,
        priority,
        status,
        severity: severity as any,
        assigneeId: assigneeId || undefined,
        attachments,
      });
      onClose();
    } catch (error) {
      console.error('Error creating task:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <div className="relative">
        {/* Header with gradient */}
        <div className="absolute inset-x-0 -top-6 h-24 bg-gradient-to-b from-primary/20 to-transparent pointer-events-none" />
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* ID preview */}
          <div className="flex items-center gap-3 p-3 bg-secondary/30 rounded-lg border border-border/50">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center">
              <span className="text-white font-bold">BUG</span>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">ID дефекта</p>
              <p className="font-mono text-sm">BUG-{new Date().getFullYear()}-XXX</p>
            </div>
          </div>

          {/* Summary */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-1">
              Summary <span className="text-destructive">*</span>
              <span className="text-xs text-muted-foreground ml-auto">Что? Где? При каких условиях?</span>
            </label>
            <input
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="Например: Кнопка 'Сохранить' не работает в форме профиля при пустом имени"
              className="input-modern"
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Описание</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="input-modern resize-none"
              placeholder="Подробное описание проблемы..."
            />
          </div>

          {/* Steps to Reproduce */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Шаги воспроизведения</label>
            <textarea
              value={stepsToReproduce}
              onChange={(e) => setStepsToReproduce(e.target.value)}
              rows={4}
              className="input-modern resize-none font-mono text-sm"
              placeholder="1. Откройте страницу&#10;2. Нажмите кнопку&#10;3. Введите данные&#10;4. ..."
            />
          </div>

          {/* Expected vs Actual */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-green-600 dark:text-green-400">
                Ожидаемый результат
              </label>
              <textarea
                value={expectedResult}
                onChange={(e) => setExpectedResult(e.target.value)}
                rows={3}
                className="input-modern resize-none border-green-200 dark:border-green-900/50 focus:ring-green-500"
                placeholder="Как должно работать..."
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-red-600 dark:text-red-400">
                Фактический результат
              </label>
              <textarea
                value={actualResult}
                onChange={(e) => setActualResult(e.target.value)}
                rows={3}
                className="input-modern resize-none border-red-200 dark:border-red-900/50 focus:ring-red-500"
                placeholder="Что происходит сейчас..."
              />
            </div>
          </div>

          {/* Severity and Priority */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Серьезность</label>
              <select
                value={severity}
                onChange={(e) => setSeverity(e.target.value)}
                className="input-modern"
              >
                <option value="critical">🔴 Critical - Критическая</option>
                <option value="major">🟠 Major - Значительная</option>
                <option value="minor">🟡 Minor - Незначительная</option>
                <option value="trivial">🔵 Trivial - Косметическая</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Приоритет</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
                className="input-modern"
              >
                {Object.entries(PRIORITIES).map(([value, { label, icon }]) => (
                  <option key={value} value={value}>{icon} {label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Status and Assignee */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Статус</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as Status)}
                className="input-modern"
              >
                {Object.entries(STATUSES).map(([value, { title, icon }]) => (
                  <option key={value} value={value}>{icon} {title}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Исполнитель</label>
              <select
                value={assigneeId}
                onChange={(e) => setAssigneeId(e.target.value)}
                className="input-modern"
              >
                <option value="">Не назначен</option>
                {MOCK_USERS.map(user => (
                  <option key={user.id} value={user.id}>{user.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Attachments */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Вложения</label>
            <FileUpload
              onFilesSelected={setAttachments}
              maxFiles={10}
              maxSize={10 * 1024 * 1024}
            />
          </div>

          {/* Tips */}
          <div className="bg-gradient-to-r from-primary/5 to-purple-600/5 rounded-lg p-4 border border-primary/10">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <div className="space-y-1 text-sm">
                <p className="font-medium text-foreground">Рекомендации по заполнению</p>
                <ul className="text-muted-foreground text-xs space-y-1 list-disc list-inside">
                  <li>Summary должен отвечать на вопросы: Что? Где? При каких условиях?</li>
                  <li>Steps to Reproduce должны быть точными и воспроизводимыми</li>
                  <li>Приложите скриншоты для наглядности</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              className="px-6"
            >
              Отмена
            </Button>
            <Button
              type="submit"
              loading={loading}
              disabled={!summary.trim()}
              className="bg-gradient-to-r from-primary to-purple-600 text-white px-6 hover:shadow-lg hover:shadow-primary/25"
            >
              Создать задачу
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
};