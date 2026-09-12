'use client';

import { useState, useCallback, createContext, useContext, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
  action?: { label: string; onClick: () => void };
}

interface ToastContextType {
  toast: (toast: Omit<Toast, 'id'>) => string;
  dismiss: (id: string) => void;
  dismissAll: () => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

interface ToastProviderProps {
  children: ReactNode;
  maxToasts?: number;
}

export function ToastProvider({ children, maxToasts = 5 }: ToastProviderProps) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((newToast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).slice(2, 9);
    const t = { ...newToast, id };
    
    setToasts((prev) => {
      const updated = [...prev, t];
      return updated.slice(-maxToasts);
    });
    
    return id;
  }, [maxToasts]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const dismissAll = useCallback(() => {
    setToasts([]);
  }, []);

  return (
    <ToastContext.Provider value={{ toast, dismiss, dismissAll }}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}

function ToastContainer({ toasts, onDismiss }: { toasts: Toast[]; onDismiss: (id: string) => void }) {
  const icons: Record<ToastType, typeof CheckCircle> = {
    success: CheckCircle,
    error: AlertCircle,
    info: Info,
    warning: AlertTriangle,
  };

  const colors: Record<ToastType, string> = {
    success: 'bg-green-50 border-green-200 text-green-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
  };

  const iconColors: Record<ToastType, string> = {
    success: 'text-green-500',
    error: 'text-red-500',
    info: 'text-blue-500',
    warning: 'text-yellow-500',
  };

  return (
    <AnimatePresence>
      <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 w-full max-w-sm pointer-events-none">
        {toasts.map((t) => {
          const Icon = icons[t.type];
          return (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, x: 100, y: 20 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              exit={{ opacity: 0, x: 100, y: 20 }}
              className={cn(
                'pointer-events-auto flex items-start gap-3 p-4 rounded-xl border shadow-lg',
                'backdrop-blur-sm',
                colors[t.type]
              )}
              role="alert"
              aria-live={t.type === 'error' ? 'assertive' : 'polite'}
            >
              <div className={cn('flex-shrink-0 mt-0.5', iconColors[t.type])}>
                <Icon className="w-5 h-5" aria-hidden="true" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold">{t.title}</p>
                {t.message && <p className="mt-0.5 text-sm opacity-90">{t.message}</p>}
                {t.action && (
                  <button
                    onClick={() => {
                      t.action?.onClick();
                      onDismiss(t.id);
                    }}
                    className="mt-2 text-sm font-medium underline hover:no-underline"
                  >
                    {t.action.label}
                  </button>
                )}
              </div>
              <button
                onClick={() => onDismiss(t.id)}
                className="flex-shrink-0 text-current opacity-50 hover:opacity-100 transition-opacity"
                aria-label="Dismiss"
              >
                <X className="w-4 h-4" />
              </button>
              {t.duration !== 0 && (
                <motion.div
                  initial={{ width: '100%' }}
                  animate={{ width: 0 }}
                  transition={{ duration: t.duration || 5000, ease: 'linear' }}
                  className="absolute bottom-0 left-0 h-1 bg-current/20 rounded-b-xl"
                  aria-hidden="true"
                />
              )}
            </motion.div>
          );
        })}
      </div>
    </AnimatePresence>
  );
}

export function useToastHelpers() {
  const { toast, dismiss, dismissAll } = useToast();
  
  return {
    success: (title: string, message?: string, options?: Partial<Toast>) =>
      toast({ type: 'success', title, message, ...options }),
    error: (title: string, message?: string, options?: Partial<Toast>) =>
      toast({ type: 'error', title, message, ...options }),
    info: (title: string, message?: string, options?: Partial<Toast>) =>
      toast({ type: 'info', title, message, ...options }),
    warning: (title: string, message?: string, options?: Partial<Toast>) =>
      toast({ type: 'warning', title, message, ...options }),
    dismiss,
    dismissAll,
  };
}