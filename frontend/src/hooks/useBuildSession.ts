// Enterprise build session management hook
import { useState, useEffect, useCallback, useRef } from 'react';
import { BuildSession, BuildStep, ProjectFile, StepType } from '../types/enterprise';
import { logger } from '../services/Logger';
import { errorHandler } from '../services/ErrorHandler';
import { performanceMonitor } from '../services/PerformanceMonitor';

interface UseBuildSessionOptions {
  prompt: string;
  onSessionUpdate?: (session: BuildSession) => void;
  onError?: (error: Error) => void;
}

interface UseBuildSessionReturn {
  session: BuildSession | null;
  loading: boolean;
  error: string | null;
  isBuilding: boolean;
  buildProgress: number;
  chatLoading: boolean;
  chatTimedOut: boolean;
  remainingSeconds: number;
  startSession: () => Promise<void>;
  retryChat: () => Promise<void>;
  cancelSession: () => void;
  updateStep: (stepId: string, updates: Partial<BuildStep>) => void;
  addStep: (step: Omit<BuildStep, 'id'>) => void;
  removeStep: (stepId: string) => void;
  updateFile: (fileId: string, updates: Partial<ProjectFile>) => void;
  addFile: (file: Omit<ProjectFile, 'id'>) => void;
  removeFile: (fileId: string) => void;
}

export const useBuildSession = ({
  prompt,
  onSessionUpdate,
  onError,
}: UseBuildSessionOptions): UseBuildSessionReturn => {
  const [session, setSession] = useState<BuildSession | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isBuilding, setIsBuilding] = useState(false);
  const [buildProgress, setBuildProgress] = useState(0);
  const [chatLoading, setChatLoading] = useState(false);
  const [chatTimedOut, setChatTimedOut] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(60);
  
  const sessionRef = useRef<BuildSession | null>(null);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);
  const progressRef = useRef<NodeJS.Timeout | null>(null);

  const generateId = useCallback(() => {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  const createInitialSession = useCallback((): BuildSession => {
    return {
      id: generateId(),
      prompt,
      status: 'initializing',
      progress: 0,
      steps: [],
      files: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      metadata: {
        environment: process.env.NODE_ENV || 'development',
        version: '1.0.0',
      },
    };
  }, [prompt, generateId]);

  const updateSession = useCallback((updates: Partial<BuildSession>) => {
    setSession(prev => {
      if (!prev) return prev;
      const updated = { ...prev, ...updates, updatedAt: new Date().toISOString() };
      sessionRef.current = updated;
      onSessionUpdate?.(updated);
      return updated;
    });
  }, [onSessionUpdate]);

  const startCountdown = useCallback((seconds: number) => {
    setRemainingSeconds(seconds);
    setChatTimedOut(false);
    
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
    }
    
    countdownRef.current = setInterval(() => {
      setRemainingSeconds(prev => {
        if (prev <= 1) {
          setChatTimedOut(true);
          setChatLoading(false);
          if (countdownRef.current) {
            clearInterval(countdownRef.current);
            countdownRef.current = null;
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  const startProgressSimulation = useCallback((steps: BuildStep[]) => {
    if (progressRef.current) {
      clearInterval(progressRef.current);
    }
    
    setIsBuilding(true);
    setBuildProgress(0);
    
    const totalSteps = Math.max(steps.length, 4);
    const stepsWithProgress = Array.from({ length: totalSteps }, (_, i) => ({
      ...steps[i] || {},
      progress: Math.round((i + 1) * (100 / totalSteps)),
    }));
    
    let stepIndex = 0;
    progressRef.current = setInterval(() => {
      if (stepIndex < stepsWithProgress.length) {
        setBuildProgress(stepsWithProgress[stepIndex].progress);
        stepIndex++;
      } else {
        setIsBuilding(false);
        if (progressRef.current) {
          clearInterval(progressRef.current);
          progressRef.current = null;
        }
      }
    }, 1000);
  }, []);

  const startSession = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const newSession = createInitialSession();
      setSession(newSession);
      sessionRef.current = newSession;
      
      logger.info('Starting build session', { sessionId: newSession.id, prompt });
      
      // Simulate template loading
      await performanceMonitor.measureAsync('template_loading', async () => {
        await new Promise(resolve => setTimeout(resolve, 1000));
      });
      
      // Add initial steps
      const initialSteps: BuildStep[] = [
        {
          id: generateId(),
          title: 'Initialize Project',
          description: 'Setting up project structure',
          type: StepType.CreateFolder,
          status: 'pending',
          path: '/',
        },
        {
          id: generateId(),
          title: 'Create Package Configuration',
          description: 'Setting up package.json and dependencies',
          type: StepType.CreateFile,
          status: 'pending',
          path: '/package.json',
        },
      ];
      
      updateSession({
        status: 'building',
        steps: initialSteps,
      });
      
      // Start chat loading simulation
      setChatLoading(true);
      startCountdown(60);
      
      // Simulate API delay
      await performanceMonitor.measureAsync('chat_generation', async () => {
        await new Promise(resolve => setTimeout(resolve, 2000));
      });
      
      // Add generated steps
      const generatedSteps: BuildStep[] = [
        {
          id: generateId(),
          title: 'Create React Components',
          description: 'Building main application components',
          type: StepType.CreateFile,
          status: 'pending',
          path: '/src/App.tsx',
        },
        {
          id: generateId(),
          title: 'Setup Styling',
          description: 'Adding CSS and styling configuration',
          type: StepType.CreateFile,
          status: 'pending',
          path: '/src/index.css',
        },
        {
          id: generateId(),
          title: 'Configure Build Tools',
          description: 'Setting up Vite configuration',
          type: StepType.CreateFile,
          status: 'pending',
          path: '/vite.config.ts',
        },
      ];
      
      const allSteps = [...initialSteps, ...generatedSteps];
      updateSession({
        steps: allSteps,
        status: 'building',
      });
      
      setChatLoading(false);
      startProgressSimulation(allSteps);
      
      logger.info('Build session started successfully', { 
        sessionId: newSession.id, 
        stepCount: allSteps.length 
      });
      
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error.message);
      onError?.(error);
      errorHandler.handleError(error, { context: 'startSession' });
    } finally {
      setLoading(false);
    }
  }, [prompt, createInitialSession, generateId, updateSession, startCountdown, startProgressSimulation, onError]);

  const retryChat = useCallback(async () => {
    try {
      setChatTimedOut(false);
      setChatLoading(true);
      startCountdown(60);
      
      logger.info('Retrying chat generation', { sessionId: session?.id });
      
      await performanceMonitor.measureAsync('chat_retry', async () => {
        await new Promise(resolve => setTimeout(resolve, 2000));
      });
      
      // Add more steps on retry
      const retrySteps: BuildStep[] = [
        {
          id: generateId(),
          title: 'Add Advanced Features',
          description: 'Implementing advanced functionality',
          type: StepType.CreateFile,
          status: 'pending',
          path: '/src/components/Advanced.tsx',
        },
        {
          id: generateId(),
          title: 'Setup Testing',
          description: 'Adding test configuration and files',
          type: StepType.CreateFile,
          status: 'pending',
          path: '/src/__tests__/App.test.tsx',
        },
      ];
      
      updateSession(prev => ({
        steps: [...(prev?.steps || []), ...retrySteps],
      }));
      
      setChatLoading(false);
      
      logger.info('Chat retry completed', { sessionId: session?.id });
      
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error.message);
      onError?.(error);
      errorHandler.handleError(error, { context: 'retryChat' });
    }
  }, [session?.id, generateId, updateSession, startCountdown, onError]);

  const cancelSession = useCallback(() => {
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
      countdownRef.current = null;
    }
    if (progressRef.current) {
      clearInterval(progressRef.current);
      progressRef.current = null;
    }
    
    setChatLoading(false);
    setIsBuilding(false);
    setRemainingSeconds(0);
    
    updateSession({ status: 'cancelled' });
    
    logger.info('Build session cancelled', { sessionId: session?.id });
  }, [session?.id, updateSession]);

  const updateStep = useCallback((stepId: string, updates: Partial<BuildStep>) => {
    updateSession(prev => ({
      steps: prev?.steps.map(step => 
        step.id === stepId ? { ...step, ...updates } : step
      ) || [],
    }));
  }, [updateSession]);

  const addStep = useCallback((step: Omit<BuildStep, 'id'>) => {
    const newStep: BuildStep = {
      ...step,
      id: generateId(),
    };
    
    updateSession(prev => ({
      steps: [...(prev?.steps || []), newStep],
    }));
  }, [generateId, updateSession]);

  const removeStep = useCallback((stepId: string) => {
    updateSession(prev => ({
      steps: prev?.steps.filter(step => step.id !== stepId) || [],
    }));
  }, [updateSession]);

  const updateFile = useCallback((fileId: string, updates: Partial<ProjectFile>) => {
    updateSession(prev => ({
      files: prev?.files.map(file => 
        file.id === fileId ? { ...file, ...updates } : file
      ) || [],
    }));
  }, [updateSession]);

  const addFile = useCallback((file: Omit<ProjectFile, 'id'>) => {
    const newFile: ProjectFile = {
      ...file,
      id: generateId(),
    };
    
    updateSession(prev => ({
      files: [...(prev?.files || []), newFile],
    }));
  }, [generateId, updateSession]);

  const removeFile = useCallback((fileId: string) => {
    updateSession(prev => ({
      files: prev?.files.filter(file => file.id !== fileId) || [],
    }));
  }, [updateSession]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (countdownRef.current) {
        clearInterval(countdownRef.current);
      }
      if (progressRef.current) {
        clearInterval(progressRef.current);
      }
    };
  }, []);

  return {
    session,
    loading,
    error,
    isBuilding,
    buildProgress,
    chatLoading,
    chatTimedOut,
    remainingSeconds,
    startSession,
    retryChat,
    cancelSession,
    updateStep,
    addStep,
    removeStep,
    updateFile,
    addFile,
    removeFile,
  };
};
