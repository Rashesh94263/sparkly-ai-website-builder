// Enterprise Chat Status Indicator Component
import React from 'react';
import { logger } from '../../services/Logger';

interface ChatStatusIndicatorProps {
  isLoading: boolean;
  isTimedOut?: boolean;
  remainingSeconds?: number;
  onRetry?: () => void;
  className?: string;
}

export const ChatStatusIndicator: React.FC<ChatStatusIndicatorProps> = ({
  isLoading,
  isTimedOut,
  remainingSeconds,
  onRetry,
  className = '',
}) => {
  const handleRetry = () => {
    try {
      logger.info('Retrying chat generation', { remainingSeconds });
      //onRetry();
    } catch (error) {
      logger.error('Failed to retry chat generation', { error });
    }
  };

  if (isLoading) {
    return (
      <div className={`text-center text-gray-700 ${className}`}>
        <div className="flex items-center justify-center space-x-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          <span>Generating project... {remainingSeconds}s remaining</span>
        </div>
      </div>
    );
  }

  return null;
};
