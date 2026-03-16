import React from 'react';
import { Button } from '../UI/Button';
import { Search, Plus, Moon, Sun, LayoutGrid, List, BarChart3, Github } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';
import { cn } from '../../utils/cn';

interface HeaderProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onSearchClick: () => void;
  onCreateClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onTabChange,
  onSearchClick,
  onCreateClick,
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
          {/* Logo with gradient */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-lg">B</span>
            </div>
            <div>
              <h1 className="text-xl font-bold">
                <span className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                  BugTracker x Быстровайти.рф
                </span>
              </h1>
              <span className="text-[10px] text-muted-foreground -mt-1 block">modern issue tracking</span>
            </div>
          </div>

          {/* Tabs with modern design */}
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
            {/* Search button with hotkey */}
            <button
              onClick={onSearchClick}
              className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary/50 hover:bg-secondary transition-all duration-200 group"
            >
              <Search className="w-4 h-4 text-muted-foreground group-hover:text-foreground" />
              <span className="text-sm text-muted-foreground group-hover:text-foreground">Поиск</span>
              <kbd className="px-1.5 py-0.5 text-xs bg-background rounded border border-border">⌘K</kbd>
            </button>

            {/* Create button */}
            <Button
              onClick={onCreateClick}
              className="bg-gradient-to-r from-primary to-purple-600 text-white hover:shadow-lg hover:shadow-primary/25 transition-all duration-200 hover-lift"
              icon={<Plus className="w-4 h-4" />}
            >
              <span className="hidden sm:inline">Создать</span>
              <kbd className="ml-2 px-1.5 py-0.5 text-xs bg-white/20 rounded">⌘N</kbd>
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

            {/* GitHub link (optional) */}
            <a
              href="#"
              className="hidden lg:flex p-2 rounded-lg hover:bg-secondary transition-all duration-200"
            >
              <Github className="w-5 h-5 text-muted-foreground" />
            </a>
          </div>
        </div>
      </div>

      {/* Auto-save indicator with animation */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary via-purple-600 to-pink-600 animate-pulse-glow" />
    </header>
  );
};