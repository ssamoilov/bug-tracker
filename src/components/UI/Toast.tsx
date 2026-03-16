import React from 'react';
import { toast as hotToast, ToastBar, Toaster } from 'react-hot-toast';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';
import { cn } from '../../utils/cn';

export const toast = hotToast;

interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
}

export const showToast = ({ message, type = 'info', duration = 3000 }: ToastProps) => {
  const icons = {
    success: <CheckCircle className="w-5 h-5 text-green-400" />,
    error: <XCircle className="w-5 h-5 text-red-400" />,
    warning: <AlertCircle className="w-5 h-5 text-yellow-400" />,
    info: <Info className="w-5 h-5 text-blue-400" />,
  };

  hotToast.custom((t) => (
    <div
      className={cn(
        'flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl',
        'backdrop-blur-xl bg-black/40 border border-white/10',
        'animate-slide-up',
        t.visible ? 'animate-enter' : 'animate-leave'
      )}
    >
      {icons[type]}
      <p className="text-sm text-white">{message}</p>
      <button
        onClick={() => hotToast.dismiss(t.id)}
        className="ml-auto p-1 rounded-lg hover:bg-white/10 transition-colors"
      >
        <X className="w-4 h-4 text-white/60" />
      </button>
    </div>
  ), { duration });
};

// Кастомный Toaster компонент
export const ToastProvider: React.FC = () => {
  return (
    <Toaster
      position="bottom-right"
      toastOptions={{
        duration: 3000,
        style: {
          background: 'transparent',
          boxShadow: 'none',
          padding: 0,
        },
      }}
    >
      {(t) => (
        <ToastBar toast={t}>
          {({ icon, message }) => (
            <div
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl',
                'backdrop-blur-xl bg-black/40 border border-white/10',
                'animate-slide-up',
                t.visible ? 'animate-enter' : 'animate-leave'
              )}
            >
              {icon}
              <p className="text-sm text-white">{message}</p>
              <button
                onClick={() => hotToast.dismiss(t.id)}
                className="ml-auto p-1 rounded-lg hover:bg-white/10 transition-colors"
              >
                <X className="w-4 h-4 text-white/60" />
              </button>
            </div>
          )}
        </ToastBar>
      )}
    </Toaster>
  );
};