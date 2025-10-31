/**
 * Компонент уведомлений и предупреждений
 */

import { AlertCircle, CheckCircle, Info, X, XCircle } from 'lucide-react';
import React, { useState, useEffect } from 'react';

export interface AlertProps {
  children: React.ReactNode;
  variant?: 'info' | 'success' | 'warning' | 'error';
  title?: string;
  dismissible?: boolean;
  icon?: React.ReactNode | boolean;
  actions?: React.ReactNode;
  className?: string;
  onDismiss?: () => void;
}

const Alert: React.FC<AlertProps> = ({
  children,
  variant = 'info',
  title,
  dismissible = false,
  icon = true,
  actions,
  className = '',
  onDismiss,
}) => {
  const [isVisible, setIsVisible] = useState(true);

  const handleDismiss = () => {
    setIsVisible(false);
    onDismiss?.();
  };

  if (!isVisible) return null;

  const variantClasses = {
    info: 'bg-blue-50 border-blue-200 text-blue-800',
    success: 'bg-green-50 border-green-200 text-green-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    error: 'bg-red-50 border-red-200 text-red-800',
  };

  const iconComponents = {
    info: <Info size={20} />,
    success: <CheckCircle size={20} />,
    warning: <AlertCircle size={20} />,
    error: <XCircle size={20} />,
  };

  const renderIcon = () => {
    if (icon === false) return null;
    if (React.isValidElement(icon)) return icon;
    return iconComponents[variant];
  };

  return (
    <div
      className={`
        relative flex p-4 border rounded-lg
        ${variantClasses[variant]}
        ${className}
      `}
    >
      {renderIcon() && (
        <div className="flex-shrink-0 mr-3">
          {renderIcon()}
        </div>
      )}

      <div className="flex-1 min-w-0">
        {title && (
          <h3 className="text-sm font-medium mb-1">{title}</h3>
        )}
        <div className="text-sm">{children}</div>
        {actions && (
          <div className="mt-3">{actions}</div>
        )}
      </div>

      {dismissible && (
        <button
          type="button"
          onClick={handleDismiss}
          className="flex-shrink-0 ml-3 p-1 rounded-md hover:bg-black hover:bg-opacity-10 transition-colors"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
};

// Компонент уведомления с автоматическим скрытием
export interface ToastProps extends Omit<AlertProps, 'dismissible'> {
  duration?: number;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
  onClose?: () => void;
}

export const Toast: React.FC<ToastProps> = ({
  duration = 5000,
  position = 'top-right',
  onClose,
  ...alertProps
}) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        onClose?.();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const handleDismiss = () => {
    setIsVisible(false);
    onClose?.();
  };

  if (!isVisible) return null;

  const positionClasses = {
    'top-right': 'fixed top-4 right-4 z-50',
    'top-left': 'fixed top-4 left-4 z-50',
    'bottom-right': 'fixed bottom-4 right-4 z-50',
    'bottom-left': 'fixed bottom-4 left-4 z-50',
    'top-center': 'fixed top-4 left-1/2 transform -translate-x-1/2 z-50',
    'bottom-center': 'fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50',
  };

  return (
    <div className={`${positionClasses[position]} max-w-sm w-full`}>
      <Alert
        {...alertProps}
        dismissible
        onDismiss={handleDismiss}
        className={`shadow-lg ${alertProps.className || ''}`}
      />
    </div>
  );
};

// Компонент баннера
export interface BannerProps extends Omit<AlertProps, 'dismissible'> {
  sticky?: boolean;
  fullWidth?: boolean;
}

export const Banner: React.FC<BannerProps> = ({
  sticky = false,
  fullWidth = true,
  className = '',
  ...alertProps
}) => {
  const stickyClasses = sticky ? 'sticky top-0 z-40' : '';
  const widthClasses = fullWidth ? 'w-full' : '';

  return (
    <div className={`${stickyClasses} ${widthClasses}`}>
      <Alert
        {...alertProps}
        dismissible
        className={`rounded-none border-x-0 ${className}`}
      />
    </div>
  );
};

// Хук для управления уведомлениями
export interface NotificationOptions {
  variant?: 'info' | 'success' | 'warning' | 'error';
  title?: string;
  duration?: number;
  position?: ToastProps['position'];
}

export const useNotification = () => {
  const [notifications, setNotifications] = useState<Array<{
    id: string;
    message: string;
    options: NotificationOptions;
  }>>([]);

  const show = (message: string, options: NotificationOptions = {}) => {
    const id = Math.random().toString(36).substr(2, 9);
    const notification = { id, message, options };
    
    setNotifications(prev => [...prev, notification]);

    // Автоматическое удаление
    const duration = options.duration ?? 5000;
    if (duration > 0) {
      setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== id));
      }, duration);
    }

    return id;
  };

  const hide = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const clear = () => {
    setNotifications([]);
  };

  // Удобные методы для разных типов уведомлений
  const success = (message: string, options?: Omit<NotificationOptions, 'variant'>) =>
    show(message, { ...options, variant: 'success' });

  const error = (message: string, options?: Omit<NotificationOptions, 'variant'>) =>
    show(message, { ...options, variant: 'error' });

  const warning = (message: string, options?: Omit<NotificationOptions, 'variant'>) =>
    show(message, { ...options, variant: 'warning' });

  const info = (message: string, options?: Omit<NotificationOptions, 'variant'>) =>
    show(message, { ...options, variant: 'info' });

  return {
    notifications,
    show,
    hide,
    clear,
    success,
    error,
    warning,
    info,
  };
};

// Компонент контейнера для уведомлений
export interface NotificationContainerProps {
  notifications: ReturnType<typeof useNotification>['notifications'];
  onClose: (id: string) => void;
  position?: ToastProps['position'];
}

export const NotificationContainer: React.FC<NotificationContainerProps> = ({
  notifications,
  onClose,
  position = 'top-right',
}) => {
  const positionClasses = {
    'top-right': 'fixed top-4 right-4 z-50 space-y-2',
    'top-left': 'fixed top-4 left-4 z-50 space-y-2',
    'bottom-right': 'fixed bottom-4 right-4 z-50 space-y-2',
    'bottom-left': 'fixed bottom-4 left-4 z-50 space-y-2',
    'top-center': 'fixed top-4 left-1/2 transform -translate-x-1/2 z-50 space-y-2',
    'bottom-center': 'fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 space-y-2',
  };

  if (notifications.length === 0) return null;

  return (
    <div className={positionClasses[position]}>
      {notifications.map(notification => (
        <div key={notification.id} className="max-w-sm w-full">
          <Alert
            variant={notification.options.variant}
            title={notification.options.title}
            dismissible
            onDismiss={() => onClose(notification.id)}
            className="shadow-lg"
          >
            {notification.message}
          </Alert>
        </div>
      ))}
    </div>
  );
};

export default Alert;