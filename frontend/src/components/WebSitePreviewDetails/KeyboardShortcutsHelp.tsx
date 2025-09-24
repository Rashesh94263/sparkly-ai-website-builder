// Enterprise Keyboard Shortcuts Help Component
import React, { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { logger } from '../../services/Logger';

interface ShortcutGroup {
  title: string;
  shortcuts: Array<{
    keys: string[];
    description: string;
  }>;
}

interface KeyboardShortcutsHelpProps {
  className?: string;
}

export const KeyboardShortcutsHelp: React.FC<KeyboardShortcutsHelpProps> = ({
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const { isDark } = useTheme();

  const shortcutGroups: ShortcutGroup[] = [
    {
      title: 'Navigation',
      shortcuts: [
        { keys: ['Ctrl', '1'], description: 'Switch to Files tab' },
        { keys: ['Ctrl', '2'], description: 'Switch to Code tab' },
        { keys: ['Ctrl', '3'], description: 'Switch to Steps tab' },
        { keys: ['Ctrl', '4'], description: 'Switch to Preview tab' },
      ],
    },
    {
      title: 'General',
      shortcuts: [
        { keys: ['Ctrl', 'T'], description: 'Toggle theme (light/dark)' },
        { keys: ['Ctrl', 'C'], description: 'Copy prompt to clipboard' },
        { keys: ['Ctrl', 'R'], description: 'Retry current operation' },
        { keys: ['Esc'], description: 'Clear focus/close modals' },
      ],
    },
  ];

  const handleToggle = () => {
    setIsOpen(!isOpen);
    logger.debug('Keyboard shortcuts help toggled', { isOpen: !isOpen });
  };

  const renderKey = (key: string) => (
    <kbd
      key={key}
      className={`
        px-2 py-1 text-xs font-mono
        bg-gray-100 dark:bg-gray-700
        text-gray-800 dark:text-gray-200
        border border-gray-300 dark:border-gray-600
        rounded shadow-sm
      `}
    >
      {key}
    </kbd>
  );

  if (!isOpen) {
    return (
      <button
        onClick={handleToggle}
        className={`
          fixed bottom-4 right-4 z-40
          w-12 h-12 rounded-full
          bg-blue-600 hover:bg-blue-700
          text-white shadow-lg
          flex items-center justify-center
          focus:outline-none focus:ring-2 focus:ring-blue-500
          transition-all duration-200
          ${className}
        `}
        aria-label="Show keyboard shortcuts"
        title="Keyboard Shortcuts (Ctrl+?)"
      >
        <span className="text-lg">⌨️</span>
      </button>
    );
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-50"
        onClick={handleToggle}
      />
      
      {/* Modal */}
      <div className={`
        fixed inset-0 z-50 flex items-center justify-center p-4
        ${className}
      `}>
        <div className={`
          bg-white dark:bg-gray-800 rounded-lg shadow-xl
          max-w-2xl w-full max-h-[80vh] overflow-y-auto
        `}>
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              Keyboard Shortcuts
            </h2>
            <button
              onClick={handleToggle}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              aria-label="Close"
            >
              <span className="text-2xl">×</span>
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {shortcutGroups.map((group, groupIndex) => (
              <div key={groupIndex}>
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-3">
                  {group.title}
                </h3>
                <div className="space-y-2">
                  {group.shortcuts.map((shortcut, shortcutIndex) => (
                    <div
                      key={shortcutIndex}
                      className="flex items-center justify-between py-2"
                    >
                      <span className="text-sm text-gray-600 dark:text-gray-300">
                        {shortcut.description}
                      </span>
                      <div className="flex items-center space-x-1">
                        {shortcut.keys.map((key, keyIndex) => (
                          <React.Fragment key={keyIndex}>
                            {renderKey(key)}
                            {keyIndex < shortcut.keys.length - 1 && (
                              <span className="text-gray-400 mx-1">+</span>
                            )}
                          </React.Fragment>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700 rounded-b-lg">
            <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
              Press <kbd className="px-1 py-0.5 text-xs bg-gray-200 dark:bg-gray-600 rounded">?</kbd> to toggle this help
            </p>
          </div>
        </div>
      </div>
    </>
  );
};
