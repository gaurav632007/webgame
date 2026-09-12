'use client';

import type { ReactNode } from 'react';
import { ToastProvider } from '@/components/ui/Toast';
import { GameProvider } from './GameProvider';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <GameProvider>
      <ToastProvider>{children}</ToastProvider>
    </GameProvider>
  );
}
