import { Zap } from "lucide-react";
import React from 'react';

export const ChatHeader: React.FC = () => {
  
return (    

    <header className="bg-white/80 backdrop-blur-lg border-b border-gray-200/50 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                    <Zap className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-xl font-semibold text-gray-900">
                    BoltAI Studio
                </h1>
            </div>
            <div className="text-sm text-gray-500">Powered by Claude AI</div>
        </div>
    </header>
);

};

    

