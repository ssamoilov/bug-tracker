import React from 'react';
import { Button } from '../UI/Button';
import { GoogleDriveSync } from '../UI/GoogleDriveSync';
import { DataBackup } from '../UI/DataBackup';
import { Search, Plus, Moon, Sun, LayoutGrid, List, BarChart3, RefreshCw } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';
import { cn } from '../../utils/cn';

interface HeaderProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onSearchClick: () => void;
  onCreateClick: () => void;
  onSyncClick?: () => void;
  isSyncing?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onTabChange,
  onSearchClick,
  onCreateClick,
  onSyncClick,
  isSyncing = false,
}) => {
  const { theme, toggleTheme } = useTheme();

  const tabs = [
    { id: 'board', label: 'Доска', icon: LayoutGrid },
    { id: 'list', label: 'Список', icon: List },
    { id: 'stats', label: 'Аналитика', icon: BarChart3 },
  ];

  return (
    <header className="sticky top-0 z-50 glass border-b border-border/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-lg">B</span>
            </div>
            <div>
              <h1 className="text-xl font-bold">
                <span className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                  BugTracker
                </span>
              </h1>
              <span className="text-[10px] text-muted-foreground -mt-1 block">cloud sync</span>
            </div>
          </div>

          {/* Tabs */}
          <div className="hidden md:flex items-center gap-1 p-1 bg-secondary/30 rounded-xl">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                    activeTab === tab.id
                      ? 'bg-white dark:bg-primary/20 text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground hover:bg-white/50 dark:hover:bg-primary/10'
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Sync button */}
            {onSyncClick && (
              <button
                onClick={onSyncClick}
                disabled={isSyncing}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-500/20 transition-all"
                title="Синхронизировать с Google Drive"
              >
                <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
                <span className="text-sm hidden sm:inline">
                  {isSyncing ? 'Синхронизация...' : 'Синхронизировать'}
                </span>
              </button>
            )}
            
            {/* Google Drive Sync */}
            <GoogleDriveSync onSyncComplete={onSyncClick} />
            
            {/* Data Backup */}
            <DataBackup onImportComplete={onSyncClick} />
            
            {/* Search button */}
            <button
              onClick={onSearchClick}
              className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary/50 hover:bg-secondary transition-all duration-200 group"
            >
              <Search className="w-4 h-4 text-muted-foreground group-hover:text-foreground" />
              <span className="text-sm text-muted-foreground group-hover:text-foreground hidden lg:inline">Поиск</span>
              <kbd className="px-1.5 py-0.5 text-xs bg-background rounded border border-border">⌘K</kbd>
            </button>

            {/* Create button */}
            <Button
              onClick={onCreateClick}
              className="bg-gradient-to-r from-primary to-purple-600 text-white hover:shadow-lg hover:shadow-primary/25 transition-all duration-200 hover-lift"
              icon={<Plus className="w-4 h-4" />}
            >
              <span className="hidden sm:inline">Создать</span>
              <kbd className="ml-2 px-1.5 py-0.5 text-xs bg-white/20 rounded hidden sm:inline">⌘N</kbd>
            </Button>

            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-secondary transition-all duration-200 hover-lift"
            >
              {theme === 'dark' ? (
                <Sun className="w-5 h-5 text-muted-foreground" />
              ) : (
                <Moon className="w-5 h-5 text-muted-foreground" />
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary via-purple-600 to-pink-600 animate-pulse-glow" />
    </header>
  );
};