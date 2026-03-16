import React from 'react';
import { Header } from './Header';
import { Toaster } from 'react-hot-toast';

interface MainLayoutProps {
  children: React.ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
  onSearchClick: () => void;
  onCreateClick: () => void;
}

export const MainLayout: React.FC<MainLayoutProps> = ({
  children,
  activeTab,
  onTabChange,
  onSearchClick,
  onCreateClick,
}) => {
  return (
    <div className="min-h-screen bg-background">
      <Header
        activeTab={activeTab}
        onTabChange={onTabChange}
        onSearchClick={onSearchClick}
        onCreateClick={onCreateClick}
      />
      
      <main className="container mx-auto">
        {children}
      </main>

      <Toaster
        position="bottom-right"
        toastOptions={{
          className: 'bg-card text-foreground border border-border',
          duration: 3000,
          style: {
            background: '#1A1A1A',
            color: '#fff',
            border: '1px solid #333',
            borderRadius: '12px',
            padding: '12px 16px',
          },
          success: {
            icon: '✅',
            style: {
              borderLeft: '4px solid #22C55E',
            },
          },
          error: {
            icon: '❌',
            style: {
              borderLeft: '4px solid #EF4444',
            },
          },
        }}
      />
    </div>
  );
};