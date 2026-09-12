'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { cn, formatTime } from '@/lib/utils';

interface TimerProps {
  endsAt: string | Date | null;
  onExpire?: () => void;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'default' | 'warning' | 'danger';
  showLabel?: boolean;
  className?: string;
}

export function Timer({
  endsAt,
  onExpire,
  size = 'md',
  variant = 'default',
  showLabel = false,
  className,
}: TimerProps) {
  const [timeLeft, setTimeLeft] = useState(0);
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    if (!endsAt) {
      // Countdown sync effect: timer must mirror the clock-driven deadline.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTimeLeft(0);
      setIsExpired(false);
      return;
    }

    const endTime = new Date(endsAt).getTime();
    const now = Date.now();
    const initialDiff = Math.max(0, Math.ceil((endTime - now) / 1000));
    
    setTimeLeft(initialDiff);
    setIsExpired(initialDiff <= 0);

    if (initialDiff <= 0) {
      onExpire?.();
      return;
    }

    const interval = setInterval(() => {
      const diff = Math.max(0, Math.ceil((endTime - Date.now()) / 1000));
      setTimeLeft(diff);
      
      if (diff <= 0) {
        setIsExpired(true);
        clearInterval(interval);
        onExpire?.();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [endsAt, onExpire]);

  const sizes = {
    sm: 'text-sm',
    md: 'text-lg',
    lg: 'text-2xl',
    xl: 'text-4xl',
  };

  const variants = {
    default: 'text-gray-900',
    warning: 'text-orange-600',
    danger: 'text-red-600',
  };

  const warningThreshold = 10;
  const isWarning = timeLeft <= warningThreshold && timeLeft > 0 && !isExpired;
  const currentVariant = isWarning ? 'warning' : timeLeft <= 0 ? 'danger' : variant;

  return (
    <div
      className={cn(
        'inline-flex items-center gap-2 font-mono font-bold tabular-nums',
        'transition-colors duration-300',
        sizes[size],
        variants[currentVariant],
        isWarning && 'animate-pulse',
        className
      )}
      role="timer"
      aria-live={isWarning ? 'assertive' : 'polite'}
      aria-label={`Time remaining: ${formatTime(timeLeft)}`}
    >
      {showLabel && <span className="text-gray-500 font-normal">⏱</span>}
      <span>{formatTime(timeLeft)}</span>
      {isWarning && <span className="text-red-500 animate-bounce">⚠</span>}
    </div>
  );
}

export function CircularTimer({
  endsAt,
  onExpire,
  size = 60,
  strokeWidth = 4,
  className,
}: {
  endsAt: string | Date | null;
  onExpire?: () => void;
  size?: number;
  strokeWidth?: number;
  className?: string;
}) {
  const [progress, setProgress] = useState(1);
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    if (!endsAt) {
      // Countdown sync effect: timer must mirror the clock-driven deadline.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setProgress(1);
      setTimeLeft(0);
      return;
    }

    const endTime = new Date(endsAt).getTime();
    const startTime = Date.now();
    const totalDuration = endTime - startTime;

    if (totalDuration <= 0) {
      setProgress(0);
      setTimeLeft(0);
      onExpire?.();
      return;
    }

    const interval = setInterval(() => {
      const now = Date.now();
      const remaining = Math.max(0, endTime - now);
      const p = remaining / totalDuration;
      
      setProgress(p);
      setTimeLeft(Math.ceil(remaining / 1000));
      
      if (remaining <= 0) {
        clearInterval(interval);
        onExpire?.();
      }
    }, 100);

    return () => clearInterval(interval);
  }, [endsAt, onExpire]);

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progress);

  const isWarning = timeLeft <= 10 && timeLeft > 0;
  const strokeColor = timeLeft <= 0 ? '#ef4444' : isWarning ? '#f97316' : '#f97316';

  return (
    <div className={cn('relative inline-flex items-center justify-center', className)} style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90" role="img" aria-label={`Timer: ${formatTime(timeLeft)} remaining`}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#fed7aa"
          strokeWidth={strokeWidth}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          style={{ transition: 'stroke-dashoffset 0.1s linear, stroke 0.3s' }}
          animate={{ strokeDashoffset }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className={cn('font-mono font-bold', isWarning && 'animate-pulse', timeLeft <= 0 && 'text-red-600')}>
          {formatTime(timeLeft)}
        </span>
      </div>
    </div>
  );
}