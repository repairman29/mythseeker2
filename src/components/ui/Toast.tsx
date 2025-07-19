import React, { useEffect } from 'react';
import { AlertCircle, Shield, X } from 'lucide-react';
import { AppNotification } from '../../types';

interface ToastProps {
  notification: AppNotification;
  onDismiss: (id: string) => void;
}

export const Toast: React.FC<ToastProps> = ({ notification, onDismiss }) => {
  const iconMap = {
    info: <AlertCircle className="h-5 w-5 text-blue-600" />,
    success: <Shield className="h-5 w-5 text-green-600" />,
    warning: <AlertCircle className="h-5 w-5 text-yellow-600" />,
    error: <X className="h-5 w-5 text-red-600" />
  };

  const bgMap = {
    info: 'bg-blue-50 border-blue-200',
    success: 'bg-green-50 border-green-200',
    warning: 'bg-yellow-50 border-yellow-200',
    error: 'bg-red-50 border-red-200'
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(notification.id);
    }, 5000);
    return () => clearTimeout(timer);
  }, [notification.id, onDismiss]);

  return (
    <div className={`${bgMap[notification.type]} border rounded-lg p-4 shadow-lg flex items-start gap-3`}>
      {iconMap[notification.type]}
      <div className="flex-1">
        <h4 className="font-medium text-gray-900">{notification.title}</h4>
        <p className="text-sm text-gray-700 mt-1">{notification.message}</p>
      </div>
      <button
        onClick={() => onDismiss(notification.id)}
        className="text-gray-400 hover:text-gray-600 transition-colors"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}; 