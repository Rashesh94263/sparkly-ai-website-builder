// Enterprise Build Interface Header Component
import React from 'react';
import { logger } from '../../services/Logger';

interface BuildInterfaceHeaderProps {
  prompt: string;
  
}

export const BuildInterfaceHeader: React.FC<BuildInterfaceHeaderProps> = ({
  prompt
}) => {


  return (
    <header className="bg-white border-b  border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900">Website Builder</h1>
        
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500">Prompt:</span>
          
          <span 
            className="text-sm text-gray-700 truncate max-w-md"
            title={prompt}
          >
            {prompt || '—'}
          </span>

         
        </div>
      </div>
    </header>
  );
};
