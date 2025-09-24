// Enterprise Tab Navigation Component
import React from 'react';
import { TabConfig } from '../../types/enterprise';
import { logger } from '../../services/Logger';

interface TabNavigationProps {
  tabs: TabConfig[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  className?: string;
}

export const TabNavigation: React.FC<TabNavigationProps> = ({
  tabs,
  activeTab,
  onTabChange,
  className = '',
}) => {
  const handleTabClick = (tabId: string) => {
    try {
      onTabChange(tabId);
      logger.debug('Tab changed', { from: activeTab, to: tabId });
    } catch (error) {
      logger.error('Failed to change tab', { error, tabId });
    }
  };

  const visibleTabs = tabs
    .filter(tab => tab.visible)
    .sort((a, b) => a.order - b.order);

  return (
    <div className={`flex border-b border-gray-200 ${className}`}>
      {visibleTabs.map((tab) => {
        const isActive = activeTab === tab.id;
        
        return (
          <button
            key={tab.id}
            onClick={() => handleTabClick(tab.id)}
            className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 text-sm font-medium border-b-2 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
              isActive
                ? 'border-blue-600 text-blue-600 bg-blue-50'
                : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
            aria-selected={isActive}
            role="tab"
            aria-controls={`tabpanel-${tab.id}`}
            id={`tab-${tab.id}`}
          >
            {tab.icon && (
              <span className="text-lg" aria-hidden="true">
                {tab.icon}
              </span>
            )}
            <span>{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
};
