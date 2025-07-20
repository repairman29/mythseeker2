import React, { useEffect, useState } from 'react';

export interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info' | 'achievement';
  duration?: number;
  onClose: () => void;
  icon?: string;
  title?: string;
}

export const Toast: React.FC<ToastProps> = ({ 
  message, 
  type = 'info', 
  duration = 5000, 
  onClose,
  icon,
  title
}) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300); // Wait for fade out animation
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const getTypeStyles = () => {
    switch (type) {
      case 'success':
        return 'bg-green-500 border-green-600 text-white';
      case 'error':
        return 'bg-red-500 border-red-600 text-white';
      case 'warning':
        return 'bg-yellow-500 border-yellow-600 text-white';
      case 'achievement':
        return 'bg-gradient-to-r from-purple-500 to-pink-500 border-purple-600 text-white shadow-lg';
      default:
        return 'bg-blue-500 border-blue-600 text-white';
    }
  };

  const getIcon = () => {
    if (icon) return icon;
    
    switch (type) {
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      case 'warning':
        return '⚠️';
      case 'achievement':
        return '🏆';
      default:
        return 'ℹ️';
    }
  };

  return (
    <div
      className={`
        fixed top-4 right-4 z-50 max-w-sm w-full
        transform transition-all duration-300 ease-in-out
        ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
      `}
    >
      <div className={`
        rounded-lg border-2 p-4 shadow-xl
        ${getTypeStyles()}
      `}>
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0 text-xl">
            {getIcon()}
          </div>
          <div className="flex-1 min-w-0">
            {title && (
              <div className="font-bold text-sm mb-1">
                {title}
              </div>
            )}
            <div className="text-sm">
              {message}
            </div>
          </div>
          <button
            onClick={() => {
              setIsVisible(false);
              setTimeout(onClose, 300);
            }}
            className="flex-shrink-0 text-white hover:text-gray-200 transition-colors"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
}; 