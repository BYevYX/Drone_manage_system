/**
 * Компонент бейджа/тега
 */

import { X } from 'lucide-react';
import React from 'react';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
  size?: 'sm' | 'md' | 'lg';
  rounded?: boolean;
  removable?: boolean;
  icon?: React.ReactNode;
  className?: string;
  onClick?: () => void;
  onRemove?: () => void;
}

const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
  rounded = false,
  removable = false,
  icon,
  className = '',
  onClick,
  onRemove,
}) => {
  const baseClasses = 'inline-flex items-center font-medium transition-all duration-200';

  const variantClasses = {
    default: 'bg-gray-100 text-gray-800 hover:bg-gray-200',
    secondary: 'bg-blue-100 text-blue-800 hover:bg-blue-200',
    success: 'bg-green-100 text-green-800 hover:bg-green-200',
    warning: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200',
    error: 'bg-red-100 text-red-800 hover:bg-red-200',
    info: 'bg-indigo-100 text-indigo-800 hover:bg-indigo-200',
  };

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
    lg: 'px-3 py-1.5 text-base',
  };

  const roundedClasses = rounded ? 'rounded-full' : 'rounded';
  const clickableClasses = onClick ? 'cursor-pointer hover:scale-105' : '';

  const badgeClasses = [
    baseClasses,
    variantClasses[variant],
    sizeClasses[size],
    roundedClasses,
    clickableClasses,
    className,
  ].filter(Boolean).join(' ');

  const handleClick = () => {
    if (onClick) {
      onClick();
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onRemove) {
      onRemove();
    }
  };

  return (
    <span className={badgeClasses} onClick={handleClick}>
      {icon && <span className="mr-1.5">{icon}</span>}
      <span>{children}</span>
      {removable && (
        <button
          type="button"
          onClick={handleRemove}
          className="ml-1.5 hover:bg-black hover:bg-opacity-10 rounded-full p-0.5 transition-colors"
        >
          <X size={size === 'sm' ? 12 : size === 'md' ? 14 : 16} />
        </button>
      )}
    </span>
  );
};

// Компонент статусного бейджа
export interface StatusBadgeProps {
  status: 'active' | 'inactive' | 'pending' | 'completed' | 'cancelled' | 'draft';
  size?: 'sm' | 'md' | 'lg';
  showDot?: boolean;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = 'md',
  showDot = true,
  className = '',
}) => {
  const statusConfig = {
    active: {
      label: 'Активный',
      variant: 'success' as const,
      dotColor: 'bg-green-500',
    },
    inactive: {
      label: 'Неактивный',
      variant: 'default' as const,
      dotColor: 'bg-gray-500',
    },
    pending: {
      label: 'Ожидание',
      variant: 'warning' as const,
      dotColor: 'bg-yellow-500',
    },
    completed: {
      label: 'Завершен',
      variant: 'success' as const,
      dotColor: 'bg-green-500',
    },
    cancelled: {
      label: 'Отменен',
      variant: 'error' as const,
      dotColor: 'bg-red-500',
    },
    draft: {
      label: 'Черновик',
      variant: 'info' as const,
      dotColor: 'bg-indigo-500',
    },
  };

  const config = statusConfig[status];
  const dotSize = size === 'sm' ? 'w-2 h-2' : size === 'md' ? 'w-2.5 h-2.5' : 'w-3 h-3';

  return (
    <Badge
      variant={config.variant}
      size={size}
      className={className}
      icon={
        showDot ? (
          <span className={`${dotSize} ${config.dotColor} rounded-full`} />
        ) : undefined
      }
    >
      {config.label}
    </Badge>
  );
};

// Компонент числового бейджа
export interface CountBadgeProps {
  count: number;
  max?: number;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'error';
  size?: 'sm' | 'md' | 'lg';
  showZero?: boolean;
  className?: string;
}

export const CountBadge: React.FC<CountBadgeProps> = ({
  count,
  max = 99,
  variant = 'primary',
  size = 'md',
  showZero = false,
  className = '',
}) => {
  if (count === 0 && !showZero) {
    return null;
  }

  const displayCount = count > max ? `${max}+` : count.toString();

  const variantClasses = {
    default: 'bg-gray-500 text-white',
    primary: 'bg-blue-500 text-white',
    success: 'bg-green-500 text-white',
    warning: 'bg-yellow-500 text-white',
    error: 'bg-red-500 text-white',
  };

  const sizeClasses = {
    sm: 'min-w-[16px] h-4 text-xs px-1',
    md: 'min-w-[20px] h-5 text-xs px-1.5',
    lg: 'min-w-[24px] h-6 text-sm px-2',
  };

  return (
    <span
      className={`
        inline-flex items-center justify-center rounded-full font-medium
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${className}
      `}
    >
      {displayCount}
    </span>
  );
};

// Компонент группы бейджей
export interface BadgeGroupProps {
  children: React.ReactNode;
  spacing?: 'sm' | 'md' | 'lg';
  wrap?: boolean;
  className?: string;
}

export const BadgeGroup: React.FC<BadgeGroupProps> = ({
  children,
  spacing = 'md',
  wrap = true,
  className = '',
}) => {
  const spacingClasses = {
    sm: 'gap-1',
    md: 'gap-2',
    lg: 'gap-3',
  };

  const wrapClasses = wrap ? 'flex-wrap' : 'flex-nowrap';

  return (
    <div className={`flex items-center ${spacingClasses[spacing]} ${wrapClasses} ${className}`}>
      {children}
    </div>
  );
};

export default Badge;