// Enterprise Build Session Hook Tests
import { renderHook, act } from '@testing-library/react';
import { useBuildSession } from '../../hooks/useBuildSession';
import { mockBuildSession } from '../../utils/testUtils';

// Mock the services
jest.mock('../../services/Logger', () => ({
  logger: {
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    fatal: jest.fn(),
  },
}));

jest.mock('../../services/ErrorHandler', () => ({
  errorHandler: {
    handleError: jest.fn(),
    handleAsyncError: jest.fn(),
    handleSyncError: jest.fn(),
  },
}));

jest.mock('../../services/PerformanceMonitor', () => ({
  performanceMonitor: {
    recordMetric: jest.fn(),
    measureAsync: jest.fn((name, fn) => fn()),
    measureSync: jest.fn((name, fn) => fn()),
    startTimer: jest.fn(() => jest.fn()),
  },
}));

describe('useBuildSession', () => {
  const mockOnSessionUpdate = jest.fn();
  const mockOnError = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize with default values', () => {
    const { result } = renderHook(() =>
      useBuildSession({
        prompt: 'Test prompt',
        onSessionUpdate: mockOnSessionUpdate,
        onError: mockOnError,
      })
    );

    expect(result.current.session).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.isBuilding).toBe(false);
    expect(result.current.buildProgress).toBe(0);
    expect(result.current.chatLoading).toBe(false);
    expect(result.current.chatTimedOut).toBe(false);
    expect(result.current.remainingSeconds).toBe(60);
  });

  it('should start session successfully', async () => {
    const { result } = renderHook(() =>
      useBuildSession({
        prompt: 'Test prompt',
        onSessionUpdate: mockOnSessionUpdate,
        onError: mockOnError,
      })
    );

    await act(async () => {
      await result.current.startSession();
    });

    expect(result.current.session).toBeTruthy();
    expect(result.current.session?.prompt).toBe('Test prompt');
    expect(result.current.session?.status).toBe('building');
    expect(result.current.session?.steps.length).toBeGreaterThan(0);
  });

  it('should handle session update callback', async () => {
    const { result } = renderHook(() =>
      useBuildSession({
        prompt: 'Test prompt',
        onSessionUpdate: mockOnSessionUpdate,
        onError: mockOnError,
      })
    );

    await act(async () => {
      await result.current.startSession();
    });

    expect(mockOnSessionUpdate).toHaveBeenCalled();
  });

  it('should handle retry chat', async () => {
    const { result } = renderHook(() =>
      useBuildSession({
        prompt: 'Test prompt',
        onSessionUpdate: mockOnSessionUpdate,
        onError: mockOnError,
      })
    );

    await act(async () => {
      await result.current.startSession();
    });

    const initialStepCount = result.current.session?.steps.length || 0;

    await act(async () => {
      await result.current.retryChat();
    });

    expect(result.current.session?.steps.length).toBeGreaterThan(initialStepCount);
  });

  it('should cancel session', async () => {
    const { result } = renderHook(() =>
      useBuildSession({
        prompt: 'Test prompt',
        onSessionUpdate: mockOnSessionUpdate,
        onError: mockOnError,
      })
    );

    await act(async () => {
      await result.current.startSession();
    });

    act(() => {
      result.current.cancelSession();
    });

    expect(result.current.session?.status).toBe('cancelled');
    expect(result.current.chatLoading).toBe(false);
    expect(result.current.isBuilding).toBe(false);
  });

  it('should update step', async () => {
    const { result } = renderHook(() =>
      useBuildSession({
        prompt: 'Test prompt',
        onSessionUpdate: mockOnSessionUpdate,
        onError: mockOnError,
      })
    );

    await act(async () => {
      await result.current.startSession();
    });

    const stepId = result.current.session?.steps[0]?.id;
    expect(stepId).toBeTruthy();

    act(() => {
      result.current.updateStep(stepId!, { status: 'completed' });
    });

    const updatedStep = result.current.session?.steps.find(s => s.id === stepId);
    expect(updatedStep?.status).toBe('completed');
  });

  it('should add step', async () => {
    const { result } = renderHook(() =>
      useBuildSession({
        prompt: 'Test prompt',
        onSessionUpdate: mockOnSessionUpdate,
        onError: mockOnError,
      })
    );

    await act(async () => {
      await result.current.startSession();
    });

    const initialStepCount = result.current.session?.steps.length || 0;

    act(() => {
      result.current.addStep({
        title: 'New Step',
        description: 'Test step',
        type: 'create_file' as any,
        status: 'pending',
        path: '/test.txt',
      });
    });

    expect(result.current.session?.steps.length).toBe(initialStepCount + 1);
  });

  it('should remove step', async () => {
    const { result } = renderHook(() =>
      useBuildSession({
        prompt: 'Test prompt',
        onSessionUpdate: mockOnSessionUpdate,
        onError: mockOnError,
      })
    );

    await act(async () => {
      await result.current.startSession();
    });

    const stepId = result.current.session?.steps[0]?.id;
    expect(stepId).toBeTruthy();

    const initialStepCount = result.current.session?.steps.length || 0;

    act(() => {
      result.current.removeStep(stepId!);
    });

    expect(result.current.session?.steps.length).toBe(initialStepCount - 1);
  });

  it('should update file', async () => {
    const { result } = renderHook(() =>
      useBuildSession({
        prompt: 'Test prompt',
        onSessionUpdate: mockOnSessionUpdate,
        onError: mockOnError,
      })
    );

    await act(async () => {
      await result.current.startSession();
    });

    // Add a file first
    act(() => {
      result.current.addFile({
        name: 'test.txt',
        type: 'file',
        path: '/test.txt',
        content: 'Initial content',
      });
    });

    const fileId = result.current.session?.files[0]?.id;
    expect(fileId).toBeTruthy();

    act(() => {
      result.current.updateFile(fileId!, { content: 'Updated content' });
    });

    const updatedFile = result.current.session?.files.find(f => f.id === fileId);
    expect(updatedFile?.content).toBe('Updated content');
  });

  it('should add file', async () => {
    const { result } = renderHook(() =>
      useBuildSession({
        prompt: 'Test prompt',
        onSessionUpdate: mockOnSessionUpdate,
        onError: mockOnError,
      })
    );

    await act(async () => {
      await result.current.startSession();
    });

    const initialFileCount = result.current.session?.files.length || 0;

    act(() => {
      result.current.addFile({
        name: 'test.txt',
        type: 'file',
        path: '/test.txt',
        content: 'Test content',
      });
    });

    expect(result.current.session?.files.length).toBe(initialFileCount + 1);
  });

  it('should remove file', async () => {
    const { result } = renderHook(() =>
      useBuildSession({
        prompt: 'Test prompt',
        onSessionUpdate: mockOnSessionUpdate,
        onError: mockOnError,
      })
    );

    await act(async () => {
      await result.current.startSession();
    });

    // Add a file first
    act(() => {
      result.current.addFile({
        name: 'test.txt',
        type: 'file',
        path: '/test.txt',
        content: 'Test content',
      });
    });

    const fileId = result.current.session?.files[0]?.id;
    expect(fileId).toBeTruthy();

    const initialFileCount = result.current.session?.files.length || 0;

    act(() => {
      result.current.removeFile(fileId!);
    });

    expect(result.current.session?.files.length).toBe(initialFileCount - 1);
  });

  it('should handle errors gracefully', async () => {
    const { result } = renderHook(() =>
      useBuildSession({
        prompt: 'Test prompt',
        onSessionUpdate: mockOnSessionUpdate,
        onError: mockOnError,
      })
    );

    // Mock an error in startSession
    const originalStartSession = result.current.startSession;
    result.current.startSession = jest.fn().mockRejectedValue(new Error('Test error'));

    await act(async () => {
      try {
        await result.current.startSession();
      } catch (error) {
        // Error should be handled by the hook
      }
    });

    expect(mockOnError).toHaveBeenCalled();
  });
});



