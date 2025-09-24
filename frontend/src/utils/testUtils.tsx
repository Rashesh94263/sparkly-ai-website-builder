// Enterprise testing utilities
import React from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ErrorBoundary } from '../components/WebSitePreviewDetails/ErrorBoundary';
import { logger } from '../services/Logger';
import { errorHandler } from '../services/ErrorHandler';
import { performanceMonitor } from '../services/PerformanceMonitor';

// Mock services for testing
jest.mock('../services/Logger', () => ({
  logger: {
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    fatal: jest.fn(),
  },
}));

jest.mock('../services/ErrorHandler', () => ({
  errorHandler: {
    handleError: jest.fn(),
    handleAsyncError: jest.fn(),
    handleSyncError: jest.fn(),
  },
}));

jest.mock('../services/PerformanceMonitor', () => ({
  performanceMonitor: {
    recordMetric: jest.fn(),
    measureAsync: jest.fn(),
    measureSync: jest.fn(),
    startTimer: jest.fn(),
  },
}));

// Test wrapper with all providers
interface TestWrapperProps {
  children: React.ReactNode;
}

const TestWrapper: React.FC<TestWrapperProps> = ({ children }) => {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        {children}
      </ErrorBoundary>
    </BrowserRouter>
  );
};

// Custom render function
const customRender = (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: TestWrapper, ...options });

// Mock data generators
export const mockBuildSession = {
  id: 'test-session-123',
  prompt: 'Create a React app',
  status: 'building' as const,
  progress: 50,
  steps: [
    {
      id: 'step-1',
      title: 'Initialize Project',
      description: 'Setting up project structure',
      type: 'create_folder' as const,
      status: 'completed' as const,
      path: '/',
    },
    {
      id: 'step-2',
      title: 'Create Components',
      description: 'Building React components',
      type: 'create_file' as const,
      status: 'in-progress' as const,
      path: '/src/App.tsx',
    },
  ],
  files: [
    {
      id: 'file-1',
      name: 'App.tsx',
      type: 'file' as const,
      path: '/src/App.tsx',
      content: 'import React from "react";\n\nexport default function App() {\n  return <div>Hello World</div>;\n}',
    },
  ],
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:01:00Z',
  metadata: {
    environment: 'test',
    version: '1.0.0',
  },
};

export const mockUser = {
  id: 'user-123',
  email: 'test@example.com',
  name: 'Test User',
  role: 'developer' as const,
  permissions: ['read', 'write'],
  preferences: {
    theme: 'light' as const,
    language: 'en',
    timezone: 'UTC',
    notifications: {
      email: true,
      push: true,
      inApp: true,
    },
    editor: {
      fontSize: 14,
      tabSize: 2,
      wordWrap: true,
      minimap: true,
    },
  },
  createdAt: '2024-01-01T00:00:00Z',
};

// Test helpers
export const waitForAsync = (ms: number = 0) => 
  new Promise(resolve => setTimeout(resolve, ms));

export const mockConsoleError = () => {
  const originalError = console.error;
  const mockError = jest.fn();
  console.error = mockError;
  return {
    mockError,
    restore: () => {
      console.error = originalError;
    },
  };
};

export const mockLocalStorage = () => {
  const store: Record<string, string> = {};
  
  const mockStorage = {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      Object.keys(store).forEach(key => delete store[key]);
    }),
    length: 0,
    key: jest.fn(),
  };

  Object.defineProperty(window, 'localStorage', {
    value: mockStorage,
    writable: true,
  });

  return mockStorage;
};

export const mockPerformanceAPI = () => {
  const mockPerformance = {
    now: jest.fn(() => Date.now()),
    mark: jest.fn(),
    measure: jest.fn(),
    getEntriesByType: jest.fn(() => []),
    getEntriesByName: jest.fn(() => []),
    clearMarks: jest.fn(),
    clearMeasures: jest.fn(),
  };

  Object.defineProperty(window, 'performance', {
    value: mockPerformance,
    writable: true,
  });

  return mockPerformance;
};

// Test assertions
export const expectToHaveBeenCalledWithError = (
  mockFn: jest.Mock,
  expectedError: string | RegExp
) => {
  expect(mockFn).toHaveBeenCalledWith(
    expect.stringMatching(expectedError),
    expect.any(Object)
  );
};

export const expectToHaveBeenCalledWithMetric = (
  mockFn: jest.Mock,
  expectedName: string,
  expectedValue: number,
  expectedUnit: string
) => {
  expect(mockFn).toHaveBeenCalledWith(
    expectedName,
    expectedValue,
    expectedUnit,
    expect.any(Object)
  );
};

// Export everything
export * from '@testing-library/react';
export { customRender as render };



