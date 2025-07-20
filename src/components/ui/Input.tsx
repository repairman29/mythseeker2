import React from 'react';
import { InputProps } from '../../types';

export const Input: React.FC<InputProps> = ({ 
  type = 'text', 
  placeholder, 
  value, 
  onChange, 
  className = '', 
  label, 
  required = false, 
  error, 
  helpText, 
  icon,
  disabled = false 
}) => (
  <div className={className}>
    {label && (
      <label className="block text-sm font-medium text-gray-200 mb-1">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
    )}
    <div className="relative">
      {icon && (
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          {icon}
        </div>
      )}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        className={`
          w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors
          bg-gray-700 text-white placeholder-gray-400
          ${icon ? 'pl-10' : ''}
          ${error ? 'border-red-400 focus:ring-red-400' : 'border-gray-600'}
          ${disabled ? 'bg-gray-600 cursor-not-allowed' : ''}
        `}
        required={required}
        disabled={disabled}
      />
    </div>
    {error && (
      <p className="mt-1 text-sm text-red-400">{error}</p>
    )}
    {helpText && !error && (
      <p className="mt-1 text-sm text-gray-400">{helpText}</p>
    )}
  </div>
); 