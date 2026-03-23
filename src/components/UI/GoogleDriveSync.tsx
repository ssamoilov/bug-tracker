import React, { useState, useEffect } from 'react';
import { Cloud, CloudOff, Upload, Download, RefreshCw, LogOut, CheckCircle } from 'lucide-react';
import { googleDrive } from '../../services/googleDrive';
import { cloudStorage } from '../../services/cloudStorage';
import { storage } from '../../utils/storage';
import toast from 'react-hot-toast';

interface GoogleDriveSyncProps {
  onSyncComplete?: () => void;
}

declare global {
  interface Window {
    google: any;
  }
}

export const GoogleDriveSync: React.FC<GoogleDriveSyncProps> = ({ onSyncComplete }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [syncInfo, setSyncInfo] = useState<{ lastSync: string | null }>({ lastSync: null });
  const [isInitialized, setIsInitialized] = useState(false);
  const [isAutoSyncing, setIsAutoSyncing] = useState(false);

  // ВАШ CLIENT ID
  const CLIENT_ID = '343045889556-p9gd051smpokqvql7guj078b02u8uep0.apps.googleusercontent.com';

  useEffect(() => {
    const loadGoogleAPI = () => {
      if (window.google?.accounts?.oauth2) {
        console.log('Google API already loaded');
        setIsInitialized(true);
        checkAuth();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      document.body.appendChild(script);

      script.onload = () => {
        console.log('Google API loaded');
        setIsInitialized(true);
        checkAuth();
      };
      
      script.onerror = () => {
        console.error('Failed to load Google API');
        toast.error('Не удалось загрузить Google API');
      };
    };

    loadGoogleAPI();

    // Проверяем статус автосинхронизации
    const checkAutoSync = () => {
      const token = googleDrive.getToken();
      setIsAutoSyncing(!!token);
    };
    
    checkAutoSync();
    const interval = setInterval(checkAutoSync, 10000);
    
    return () => clearInterval(interval);
  }, []);

  const checkAuth = async () => {
    const token = googleDrive.getToken();
    setIsAuthenticated(!!token);
    
    if (token) {
      try {
        const info = await googleDrive.getSyncInfo();
        setSyncInfo(info);
      } catch (error) {
        console.error('Error getting sync info:', error);
      }
    }
  };

  const handleLogin = () => {
    if (!isInitialized) {
      toast.error('Загрузка Google API...');
      return;
    }

    if (!window.google?.accounts?.oauth2) {
      toast.error('Google API не загружен. Обновите страницу.');
      return;
    }

    try {
      const client = window.google.accounts.oauth2.initTokenClient({
        client_id: CLIENT_ID,
        scope: 'https://www.googleapis.com/auth/drive.file',
        callback: async (tokenResponse: any) => {
          console.log('Token response:', tokenResponse);
          if (tokenResponse.access_token) {
            console.log('Token received successfully');
            googleDrive.setToken(tokenResponse.access_token);
            setIsAuthenticated(true);
            setIsAutoSyncing(true);
            toast.success('Успешный вход в Google Drive');
            toast('Автоматическая синхронизация включена', {
              icon: '🔄',
              duration: 3000,
            });
            
            // Запускаем автосинхронизацию
            cloudStorage.startAutoSync();
            
            if (onSyncComplete) {
              onSyncComplete();
            }
          } else if (tokenResponse.error) {
            console.error('Auth error:', tokenResponse);
            toast.error('Ошибка авторизации: ' + tokenResponse.error);
          }
        },
        error_callback: (error: any) => {
          console.error('OAuth error:', error);
          let errorMessage = 'Ошибка при входе в Google Drive';
          if (error.message) {
            errorMessage += ': ' + error.message;
          }
          if (errorMessage.includes('popup_closed_by_user')) {
            errorMessage = 'Вход отменен';
          }
          toast.error(errorMessage);
        },
      });

      client.requestAccessToken();
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Ошибка при инициализации входа');
    }
  };

  const handleLogout = () => {
    googleDrive.clearToken();
    setIsAuthenticated(false);
    setIsAutoSyncing(false);
    setSyncInfo({ lastSync: null });
    cloudStorage.stopAutoSync();
    toast.success('Выход выполнен');
    toast('Автоматическая синхронизация отключена', {
      icon: '⏸️',
      duration: 3000,
    });
  };

  const saveToDrive = async () => {
    if (!isAuthenticated) {
      toast.error('Сначала войдите в Google Drive');
      return;
    }

    setIsLoading(true);
    try {
      const tasks = await storage.getTasks();
      const users = await storage.getUsers();
      
      await googleDrive.saveData(tasks, users);
      
      const info = await googleDrive.getSyncInfo();
      setSyncInfo(info);
      
      toast.success(`Сохранено ${tasks.length} задач в Google Drive`);
      
      if (onSyncComplete) {
        onSyncComplete();
      }
    } catch (error) {
      console.error('Save error:', error);
      toast.error('Ошибка при сохранении в Google Drive');
    } finally {
      setIsLoading(false);
    }
  };

  const loadFromDrive = async () => {
    if (!isAuthenticated) {
      toast.error('Сначала войдите в Google Drive');
      return;
    }

    setIsLoading(true);
    try {
      const data = await googleDrive.loadData();
      
      if (data && data.tasks.length > 0) {
        const confirmed = window.confirm(
          `Найдены данные в Google Drive (${data.tasks.length} задач).\n\n` +
          `Загрузить их? Текущие данные будут заменены.`
        );
        
        if (confirmed) {
          await storage.saveTasks(data.tasks);
          toast.success(`Загружено ${data.tasks.length} задач из Google Drive`);
          
          if (onSyncComplete) {
            onSyncComplete();
          }
          window.location.reload();
        }
      } else {
        toast('В Google Drive нет сохраненных данных', {
          icon: 'ℹ️',
          duration: 3000,
        });
      }
    } catch (error) {
      console.error('Load error:', error);
      toast.error('Ошибка при загрузке из Google Drive');
    } finally {
      setIsLoading(false);
    }
  };

  const syncData = async () => {
    if (!isAuthenticated) {
      toast.error('Сначала войдите в Google Drive');
      return;
    }

    setIsLoading(true);
    try {
      await cloudStorage.syncNow();
      
      const info = await googleDrive.getSyncInfo();
      setSyncInfo(info);
      
      if (onSyncComplete) {
        onSyncComplete();
      }
    } catch (error) {
      console.error('Sync error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative group">
      <button
        onClick={isAuthenticated ? undefined : handleLogin}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all ${
          isAuthenticated
            ? 'bg-green-500/10 text-green-600 dark:text-green-400 hover:bg-green-500/20'
            : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
        }`}
        title={isAuthenticated ? 'Google Drive синхронизация (авто)' : 'Войти в Google Drive'}
      >
        {isAuthenticated ? (
          <Cloud className="w-4 h-4" />
        ) : (
          <CloudOff className="w-4 h-4" />
        )}
        {isAuthenticated && isAutoSyncing && (
          <CheckCircle className="w-3 h-3 absolute -top-1 -right-1 text-green-500" />
        )}
        <span className="text-sm hidden sm:inline">
          {isAuthenticated ? 'Drive' : 'Войти'}
        </span>
      </button>

      {isAuthenticated && (
        <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
          <div className="p-3 border-b border-gray-200 dark:border-gray-700">
            <p className="text-sm font-medium flex items-center gap-2">
              Google Drive
              {isAutoSyncing && (
                <span className="text-xs bg-green-500/20 text-green-600 px-2 py-0.5 rounded-full">
                  Авто
                </span>
              )}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {syncInfo.lastSync 
                ? `Синхронизация:\n${new Date(syncInfo.lastSync).toLocaleString()}`
                : 'Нет данных в Drive'}
            </p>
          </div>
          
          <div className="p-2 space-y-1">
            <button
              onClick={saveToDrive}
              disabled={isLoading}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
            >
              <Upload className="w-4 h-4" />
              Сохранить в Drive
            </button>
            
            <button
              onClick={loadFromDrive}
              disabled={isLoading}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              Загрузить из Drive
            </button>
            
            <button
              onClick={syncData}
              disabled={isLoading}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              Синхронизировать сейчас
            </button>
            
            <div className="border-t border-gray-200 dark:border-gray-700 my-1" />
            
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Выйти
            </button>
          </div>
        </div>
      )}
    </div>
  );
};