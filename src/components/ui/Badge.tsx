'use client';

import { cn } from '@/lib/utils';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  dot?: boolean;
  pulse?: boolean;
}

export function Badge({
  className,
  variant = 'default',
  size = 'md',
  dot = false,
  pulse = false,
  children,
  ...props
}: BadgeProps) {
  const variants = {
    default: 'bg-gray-100 text-gray-700',
    success: 'bg-green-100 text-green-700',
    warning: 'bg-yellow-100 text-yellow-700',
    danger: 'bg-red-100 text-red-700',
    info: 'bg-blue-100 text-blue-700',
    primary: 'bg-orange-100 text-orange-700',
    secondary: 'bg-purple-100 text-purple-700',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
    lg: 'px-3 py-1.5 text-base',
  };

  const dotColors = {
    default: 'bg-gray-400',
    success: 'bg-green-500',
    warning: 'bg-yellow-500',
    danger: 'bg-red-500',
    info: 'bg-blue-500',
    primary: 'bg-orange-500',
    secondary: 'bg-purple-500',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 font-medium rounded-full',
        'transition-colors duration-200',
        variants[variant],
        sizes[size],
        pulse && 'animate-pulse',
        className
      )}
      {...props}
    >
      {dot && (
        <span
          className={cn(
            'rounded-full',
            dotColors[variant],
            size === 'sm' && 'w-1.5 h-1.5',
            size === 'md' && 'w-2 h-2',
            size === 'lg' && 'w-2.5 h-2.5'
          )}
          aria-hidden="true"
        />
      )}
      {children}
    </span>
  );
}

export function RoleBadge({ role }: { role: 'civilian' | 'imposter' | 'spectator' }) {
  const configs = {
    civilian: { label: '👤 Civilian', variant: 'success' as const, icon: '👤' },
    imposter: { label: '🕵️ Imposter', variant: 'danger' as const, icon: '🕵️' },
    spectator: { label: '👁️ Spectator', variant: 'info' as const, icon: '👁️' },
  };
  
  const config = configs[role];
  
  return (
    <Badge variant={config.variant} dot pulse={role === 'imposter'}>
      {config.icon} {config.label}
    </Badge>
  );
}

export function PhaseBadge({ phase }: { phase: string }) {
  const configs: Record<string, { label: string; variant: BadgeProps['variant']; icon: string }> = {
    lobby: { label: '🏠 Lobby', variant: 'info', icon: '🏠' },
    role_reveal: { label: '🎭 Roles', variant: 'primary', icon: '🎭' },
    clue: { label: '💬 Clues', variant: 'warning', icon: '💬' },
    discussion: { label: '🗣️ Discuss', variant: 'secondary', icon: '🗣️' },
    voting: { label: '🗳️ Voting', variant: 'danger', icon: '🗳️' },
    result: { label: '🏆 Result', variant: 'success', icon: '🏆' },
    game_over: { label: '🎮 Game Over', variant: 'default', icon: '🎮' },
  };
  
  const config = configs[phase] || { label: phase, variant: 'default', icon: '❓' };
  
  return <Badge variant={config.variant}>{config.icon} {config.label}</Badge>;
}