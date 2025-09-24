// Enterprise Theme Toggle Component
import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { logger } from '../../services/Logger';

interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  className = '',
  showLabel = true,
  size = 'md',
}) => {
  const { theme, isDark, toggleTheme } = useTheme();

  const handleToggle = () => {
    try {
      toggleTheme();
      logger.info('Theme toggle clicked', { currentTheme: theme, isDark });
    } catch (error) {
      logger.error('Failed to toggle theme', { error });
    }
  };

  const sizeClasses = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg',
  };

  return (
    <button
      onClick={handleToggle}
      className={`
        ${sizeClasses[size]}
        flex items-center justify-center
        rounded-lg border border-gray-300 dark:border-gray-600
        bg-white dark:bg-gray-800
        text-gray-700 dark:text-gray-200
        hover:bg-gray-50 dark:hover:bg-gray-700
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
        transition-all duration-200 ease-in-out
        ${className}
      `}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      title={`Current: ${theme} mode (${isDark ? 'dark' : 'light'})`}
    >
      {isDark ? (
        <span className="text-yellow-500" role="img" aria-label="Sun">
          ☀️
        </span>
      ) : (
        <span className="text-blue-600" role="img" aria-label="Moon">
          🌙
        </span>
      )}
      {showLabel && (
        <span className="ml-2 text-xs font-medium">
          {isDark ? 'Light' : 'Dark'}
        </span>
      )}
    </button>
  );
};
