// Enterprise Loading Spinner Component
import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: 'primary' | 'secondary' | 'white' | 'gray';
  className?: string;
  text?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  color = 'primary',
  className = '',
  text,
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12',
  };

  const colorClasses = {
    primary: 'text-blue-600',
    secondary: 'text-gray-600',
    white: 'text-white',
    gray: 'text-gray-400',
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className="flex items-center space-x-2">
        <div
          className={`
            ${sizeClasses[size]}
            ${colorClasses[color]}
            animate-spin rounded-full border-2 border-current border-t-transparent
          `}
          role="status"
          aria-label="Loading"
        />
        {text && (
          <span className="text-sm text-gray-600 dark:text-gray-300">
            {text}
          </span>
        )}
      </div>
    </div>
  );
};

// Specialized loading components
export const LoadingOverlay: React.FC<{ 
  isVisible: boolean; 
  text?: string; 
  className?: string;
}> = ({ isVisible, text = 'Loading...', className = '' }) => {
  if (!isVisible) return null;

  return (
    <div className={`
      fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50
      ${className}
    `}>
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
        <LoadingSpinner size="lg" text={text} />
      </div>
    </div>
  );
};

export const LoadingButton: React.FC<{
  isLoading: boolean;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
  onClick?: () => void;
}> = ({ isLoading, children, className = '', disabled, onClick }) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`
        relative flex items-center justify-center
        px-4 py-2 rounded-md font-medium
        bg-blue-600 text-white
        hover:bg-blue-700 disabled:bg-gray-400
        focus:outline-none focus:ring-2 focus:ring-blue-500
        transition-colors duration-200
        ${className}
      `}
    >
      {isLoading && (
        <div className="absolute left-2">
          <LoadingSpinner size="sm" color="white" />
        </div>
      )}
      <span className={isLoading ? 'ml-6' : ''}>
        {children}
      </span>
    </button>
  );
};
