// Enterprise Steps List Component
import React from 'react';
import { BuildStep, StepType } from '../../types/enterprise';
import { logger } from '../../services/Logger';

interface StepsListProps {
  steps: BuildStep[];
  loading: boolean;
  onStepClick?: (step: BuildStep) => void;
  className?: string;
}

const getStepIcon = (type: StepType): string => {
  switch (type) {
    case StepType.CreateFile:
      return '📄';
    case StepType.CreateFolder:
      return '📁';
    case StepType.EditFile:
      return '✏️';
    case StepType.DeleteFile:
      return '🗑️';
    case StepType.RunScript:
      return '⚡';
    case StepType.InstallDependency:
      return '📦';
    case StepType.ConfigureEnvironment:
      return '⚙️';
    case StepType.Deploy:
      return '🚀';
    case StepType.Test:
      return '🧪';
    case StepType.Build:
      return '🔨';
    default:
      return '📋';
  }
};

const getStatusColor = (status: BuildStep['status']): string => {
  switch (status) {
    case 'pending':
      return 'text-gray-500';
    case 'in-progress':
      return 'text-blue-600';
    case 'completed':
      return 'text-green-600';
    case 'failed':
      return 'text-red-600';
    case 'skipped':
      return 'text-yellow-600';
    default:
      return 'text-gray-500';
  }
};

const getStatusIcon = (status: BuildStep['status']): string => {
  switch (status) {
    case 'pending':
      return '⏳';
    case 'in-progress':
      return '🔄';
    case 'completed':
      return '✅';
    case 'failed':
      return '❌';
    case 'skipped':
      return '⏭️';
    default:
      return '⏳';
  }
};

export const StepsList: React.FC<StepsListProps> = ({
  steps,
  loading,
  onStepClick,
  className = '',
}) => {
  const handleStepClick = (step: BuildStep) => {
    if (onStepClick) {
      try {
        logger.debug('Step clicked', { stepId: step.id, stepTitle: step.title });
        onStepClick(step);
      } catch (error) {
        logger.error('Failed to handle step click', { error, stepId: step.id });
      }
    }
  };

  if (loading) {
    return (
      <div className={`p-4 text-center text-blue-600 ${className}`}>
        <div className="flex items-center justify-center space-x-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          <span>Loading steps...</span>
        </div>
      </div>
    );
  }

  if (steps.length === 0) {
    return (
      <div className={`p-4 text-center text-gray-500 ${className}`}>
        <div className="text-sm">No steps available</div>
      </div>
    );
  }

  return (
    <div className={`p-4 ${className}`}>
      <ul className="space-y-2">
        {steps.map((step) => (
          <li
            key={step.id}
            className={`text-sm mb-1 flex items-center cursor-pointer hover:bg-blue-50 rounded px-2 py-1 transition-colors ${
              onStepClick ? 'hover:shadow-sm' : ''
            }`}
            onClick={() => handleStepClick(step)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleStepClick(step);
              }
            }}
            aria-label={`Step: ${step.title}`}
          >
            <span className="mr-2 text-lg" aria-hidden="true">
              {getStepIcon(step.type)}
            </span>
            
            <span className="mr-2 text-sm" aria-hidden="true">
              {getStatusIcon(step.status)}
            </span>
            
            <div className="flex-1 min-w-0">
              <div className="font-medium text-gray-800 truncate">
                {step.title}
              </div>
              {step.description && (
                <div className="text-xs text-gray-600 truncate">
                  {step.description}
                </div>
              )}
            </div>
            
            <span className={`text-xs font-medium ${getStatusColor(step.status)}`}>
              {step.status.replace('-', ' ')}
            </span>
            
            {step.progress !== undefined && (
              <div className="ml-2 w-16 bg-gray-200 rounded-full h-1">
                <div
                  className="bg-blue-600 h-1 rounded-full transition-all duration-300"
                  style={{ width: `${step.progress}%` }}
                />
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};
