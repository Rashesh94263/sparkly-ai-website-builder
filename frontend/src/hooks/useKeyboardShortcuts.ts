// Enterprise Keyboard Shortcuts Hook
import { useEffect, useCallback } from 'react';
import { logger } from '../services/Logger';

export interface KeyboardShortcut {
  key: string;
  ctrlKey?: boolean;
  altKey?: boolean;
  shiftKey?: boolean;
  metaKey?: boolean;
  action: () => void;
  description: string;
  preventDefault?: boolean;
}

export const useKeyboardShortcuts = (shortcuts: KeyboardShortcut[]) => {
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    const matchingShortcut = shortcuts.find(shortcut => {
      const keyMatch = shortcut.key.toLowerCase() === event.key.toLowerCase();
      const ctrlMatch = !!shortcut.ctrlKey === event.ctrlKey;
      const altMatch = !!shortcut.altKey === event.altKey;
      const shiftMatch = !!shortcut.shiftKey === event.shiftKey;
      const metaMatch = !!shortcut.metaKey === event.metaKey;

      return keyMatch && ctrlMatch && altMatch && shiftMatch && metaMatch;
    });

    if (matchingShortcut) {
      if (matchingShortcut.preventDefault !== false) {
        event.preventDefault();
      }

      try {
        matchingShortcut.action();
        logger.debug('Keyboard shortcut executed', {
          key: matchingShortcut.key,
          description: matchingShortcut.description,
          modifiers: {
            ctrl: matchingShortcut.ctrlKey,
            alt: matchingShortcut.altKey,
            shift: matchingShortcut.shiftKey,
            meta: matchingShortcut.metaKey,
          },
        });
      } catch (error) {
        logger.error('Keyboard shortcut action failed', {
          error,
          key: matchingShortcut.key,
          description: matchingShortcut.description,
        });
      }
    }
  }, [shortcuts]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
};

// Predefined shortcut sets for common actions
export const createNavigationShortcuts = (
  onTabChange: (tab: string) => void
): KeyboardShortcut[] => [
  {
    key: '1',
    ctrlKey: true,
    action: () => onTabChange('files'),
    description: 'Switch to Files tab',
  },
  {
    key: '2',
    ctrlKey: true,
    action: () => onTabChange('code'),
    description: 'Switch to Code tab',
  },
  {
    key: '3',
    ctrlKey: true,
    action: () => onTabChange('steps'),
    description: 'Switch to Steps tab',
  },
  {
    key: '4',
    ctrlKey: true,
    action: () => onTabChange('preview'),
    description: 'Switch to Preview tab',
  },
];

export const createGeneralShortcuts = (
  onToggleTheme: () => void,
  onCopyPrompt: () => void,
  onRetry: () => void
): KeyboardShortcut[] => [
  {
    key: 't',
    ctrlKey: true,
    action: onToggleTheme,
    description: 'Toggle theme (light/dark)',
  },
  {
    key: 'c',
    ctrlKey: true,
    action: onCopyPrompt,
    description: 'Copy prompt to clipboard',
  },
  {
    key: 'r',
    ctrlKey: true,
    action: onRetry,
    description: 'Retry current operation',
  },
  {
    key: 'Escape',
    action: () => {
      // Close any open modals or clear selections
      document.activeElement?.blur();
    },
    description: 'Clear focus/close modals',
    preventDefault: false,
  },
];



