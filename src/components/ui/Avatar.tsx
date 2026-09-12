'use client';

import { cn } from '@/lib/utils';
import { AVATARS } from '@/types/game';

interface AvatarProps {
  avatarId: number;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  nickname?: string;
  isHost?: boolean;
  role?: 'civilian' | 'imposter' | 'spectator';
  className?: string;
  showStatus?: boolean;
  isConnected?: boolean;
}

const sizes = {
  xs: 'w-6 h-6 text-xs',
  sm: 'w-8 h-8 text-sm',
  md: 'w-12 h-12 text-base',
  lg: 'w-16 h-16 text-lg',
  xl: 'w-20 h-20 text-xl',
  '2xl': 'w-24 h-24 text-2xl',
};

const statusSizes = {
  xs: 'w-1.5 h-1.5',
  sm: 'w-2 h-2',
  md: 'w-3 h-3',
  lg: 'w-3.5 h-3.5',
  xl: 'w-4 h-4',
  '2xl': 'w-5 h-5',
};

export function Avatar({
  avatarId,
  size = 'md',
  nickname,
  isHost = false,
  role,
  className,
  showStatus = false,
  isConnected = true,
}: AvatarProps) {
  const avatar = AVATARS[avatarId - 1] || AVATARS[0];
  const initials = nickname ? getInitials(nickname) : avatar.name.slice(0, 2);
  
  const gradientColors = [
    'from-orange-400 to-pink-500',
    'from-blue-400 to-purple-500',
    'from-green-400 to-teal-500',
    'from-purple-400 to-pink-500',
    'from-yellow-400 to-orange-500',
    'from-teal-400 to-cyan-500',
    'from-pink-400 to-rose-500',
    'from-indigo-400 to-blue-500',
  ];
  
  const gradient = gradientColors[(avatarId - 1) % gradientColors.length];

  const hostBadge = (
    <span className={cn(
      'absolute -top-1 -right-1 flex items-center justify-center',
      'bg-yellow-400 text-yellow-900 rounded-full border-2 border-white',
      'shadow-lg',
      statusSizes[size]
    )} aria-label="Host">
      <span aria-hidden="true" className="text-xs">H</span>
    </span>
  );

  const statusBadge = (
    <span
      className={cn(
        'absolute bottom-0 right-0 rounded-full border-2 border-white',
        statusSizes[size]
      )}
      style={{
        backgroundColor: isConnected ? '#22c55e' : '#ef4444',
      }}
      aria-label={isConnected ? 'Online' : 'Offline'}
    />
  );

  const imposterBadge = (
    <span className={cn(
      'absolute -top-1 -left-1 flex items-center justify-center',
      'bg-purple-500 text-white rounded-full border-2 border-white',
      'shadow-lg',
      statusSizes[size]
    )} aria-label="Imposter">
      <span aria-hidden="true" className="text-xs">I</span>
    </span>
  );

  return (
    <div className={cn('relative inline-flex items-center justify-center', className)}>
      <div
        className={cn(
          'rounded-full bg-gradient-to-br',
          gradient,
          'flex items-center justify-center font-bold text-white',
          'shadow-lg shadow-orange-500/25',
          sizes[size],
          'overflow-hidden'
        )}
        aria-label={nickname || avatar.name}
      >
        {initials}
      </div>
      
      {isHost ? hostBadge : null}
      
      {showStatus ? statusBadge : null}
      
      {role === 'imposter' ? imposterBadge : null}
    </div>
  );
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function AvatarPicker({
  selectedId,
  onSelect,
  size = 'md',
  className,
}: {
  selectedId: number;
  onSelect: (id: number) => void;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}) {
  return (
    <div className={cn('flex flex-wrap gap-3', className)} role="radiogroup" aria-label="Choose avatar">
      {AVATARS.map((avatar) => (
        <button
          key={avatar.id}
          onClick={() => onSelect(avatar.id)}
          className={cn(
            'relative rounded-full transition-all duration-200',
            'focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2',
            selectedId === avatar.id
              ? 'ring-4 ring-orange-500 scale-110'
              : 'hover:scale-105'
          )}
          role="radio"
          aria-checked={selectedId === avatar.id}
          aria-label={avatar.name}
        >
          <Avatar avatarId={avatar.id} size={size} />
        </button>
      ))}
    </div>
  );
}