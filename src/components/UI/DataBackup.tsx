import React, { useState } from 'react';
import { Button } from './Button';
import { Download, Upload, Database, X } from 'lucide-react';
import { storage } from '../../utils/storage';
import toast from 'react-hot-toast';

interface DataBackupProps {
  onImportComplete?: () => void;
}

export const DataBackup: React.FC<DataBackupProps> = ({ onImportComplete }) => {
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [showModal, setShowModal] = useState(false);

  // Экспорт данных
  const exportData = async () => {
    try {
      setIsExporting(true);
      
      const tasks = await storage.getTasks();
      const users = await storage.getUsers();
      
      const exportData = {
        version: '1.0',
        exportDate: new Date().toISOString(),
        tasks,
        users,
      };
      
      const jsonStr = JSON.stringify(exportData, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `bugtracker-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast.success(`Экспортировано ${tasks.length} задач`);
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Ошибка при экспорте данных');
    } finally {
      setIsExporting(false);
    }
  };

  // Импорт данных
  const importData = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    try {
      setIsImporting(true);
      
      const text = await file.text();
      const data = JSON.parse(text);
      
      if (!data.tasks || !Array.isArray(data.tasks)) {
        throw new Error('Неверный формат файла');
      }
      
      const confirmed = window.confirm(
        `Внимание! Импорт заменит все текущие данные (${data.tasks.length} задач).\n\nПродолжить?`
      );
      
      if (!confirmed) return;
      
      await storage.saveTasks(data.tasks);
      
      toast.success(`Импортировано ${data.tasks.length} задач`);
      
      if (onImportComplete) {
        onImportComplete();
      }
      
      setTimeout(() => {
        window.location.reload();
      }, 1000);
      
    } catch (error) {
      console.error('Import error:', error);
      toast.error('Ошибка при импорте данных. Проверьте формат файла.');
    } finally {
      setIsImporting(false);
      setShowModal(false);
    }
  };

  // Очистка всех данных
  const clearAllData = async () => {
    const confirmed = window.confirm(
      '⚠️ ВНИМАНИЕ! Это действие удалит ВСЕ задачи без возможности восстановления.\n\nПродолжить?'
    );
    
    if (!confirmed) return;
    
    try {
      await storage.clearAllTasks();
      toast.success('Все данные удалены');
      setTimeout(() => window.location.reload(), 1000);
    } catch (error) {
      toast.error('Ошибка при очистке данных');
    }
  };

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        title="Управление данными"
      >
        <Database className="w-4 h-4" />
        <span className="text-sm hidden sm:inline">Данные</span>
      </button>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowModal(false)} />
          
          <div className="relative bg-white dark:bg-gray-900 rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl animate-scale-in">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <X className="w-5 h-5" />
            </button>
            
            <h3 className="text-xl font-bold mb-2">Управление данными</h3>
            <p className="text-sm text-gray-500 mb-6">
              Экспортируйте или импортируйте задачи для переноса между устройствами
            </p>
            
            <div className="space-y-3">
              <button
                onClick={exportData}
                disabled={isExporting}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
              >
                <Download className="w-4 h-4" />
                {isExporting ? 'Экспорт...' : 'Экспортировать задачи'}
              </button>
              
              <label className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors cursor-pointer">
                <Upload className="w-4 h-4" />
                {isImporting ? 'Импорт...' : 'Импортировать задачи'}
                <input
                  type="file"
                  accept=".json"
                  onChange={importData}
                  className="hidden"
                  disabled={isImporting}
                />
              </label>
              
              <div className="border-t border-gray-200 dark:border-gray-700 my-4" />
              
              <button
                onClick={clearAllData}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                🗑️ Удалить все данные
              </button>
            </div>
            
            <p className="text-xs text-gray-400 mt-4 text-center">
              Данные хранятся локально в вашем браузере.<br />
              Экспорт позволяет переносить задачи между устройствами.
            </p>
          </div>
        </div>
      )}
    </>
  );
};