// Enterprise Build Progress Bar Component
import React from 'react';
import { logger } from '../../services/Logger';

interface BuildProgressBarProps {
  progress: number;
  isBuilding: boolean;
  onCancel?: () => void;
}

export const BuildProgressBar: React.FC<BuildProgressBarProps> = ({
  progress,
  isBuilding,
  onCancel,
}) => {
  const handleCancel = () => {
    if (onCancel) {
      logger.info('Build cancelled by user', { progress });
      onCancel();
    }
  };

  if (!isBuilding) return null;

  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              Building Project
            </span>
            <span className="text-sm text-gray-500">
              {Math.round(progress)}%
            </span>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
              role="progressbar"
              aria-valuenow={progress}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`Build progress: ${Math.round(progress)}%`}
            />
          </div>
        </div>
        
        {onCancel && (
          <button
            onClick={handleCancel}
            className="ml-4 text-sm px-3 py-2 rounded border border-red-300 text-red-700 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
            aria-label="Cancel build process"
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  );
};
