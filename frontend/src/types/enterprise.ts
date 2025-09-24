// Enterprise-level type definitions
export interface EnterpriseConfig {
  api: {
    baseUrl: string;
    timeout: number;
    retryAttempts: number;
    retryDelay: number;
  };
  features: {
    enableLogging: boolean;
    enableAnalytics: boolean;
    enableErrorReporting: boolean;
    enablePerformanceMonitoring: boolean;
  };
  ui: {
    theme: 'light' | 'dark' | 'auto';
    language: string;
    timezone: string;
  };
  security: {
    enableCSP: boolean;
    enableCORS: boolean;
    allowedOrigins: string[];
  };
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  metadata?: {
    timestamp: string;
    requestId: string;
    version: string;
  };
}

export interface BuildSession {
  id: string;
  prompt: string;
  status: 'initializing' | 'building' | 'completed' | 'failed' | 'cancelled';
  progress: number;
  steps: BuildStep[];
  files: ProjectFile[];
  createdAt: string;
  updatedAt: string;
  metadata: {
    userId?: string;
    sessionId?: string;
    environment: string;
    version: string;
  };
}

export interface BuildStep {
  id: string;
  title: string;
  description: string;
  type: StepType;
  status: 'pending' | 'in-progress' | 'completed' | 'failed' | 'skipped';
  code?: string;
  path?: string;
  progress?: number;
  dependencies?: string[];
  estimatedDuration?: number;
  actualDuration?: number;
  error?: {
    code: string;
    message: string;
    stack?: string;
  };
  metadata?: Record<string, any>;
}

export interface ProjectFile {
  id: string;
  name: string;
  type: 'file' | 'folder';
  path: string;
  content?: string;
  size?: number;
  mimeType?: string;
  children?: ProjectFile[];
  permissions?: {
    read: boolean;
    write: boolean;
    execute: boolean;
  };
  metadata?: {
    createdAt: string;
    updatedAt: string;
    checksum?: string;
  };
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'developer' | 'viewer';
  permissions: string[];
  preferences: UserPreferences;
  createdAt: string;
  lastLoginAt?: string;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'auto';
  language: string;
  timezone: string;
  notifications: {
    email: boolean;
    push: boolean;
    inApp: boolean;
  };
  editor: {
    fontSize: number;
    tabSize: number;
    wordWrap: boolean;
    minimap: boolean;
  };
}

export interface LogEntry {
  id: string;
  level: 'debug' | 'info' | 'warn' | 'error' | 'fatal';
  message: string;
  context?: Record<string, any>;
  timestamp: string;
  userId?: string;
  sessionId?: string;
  requestId?: string;
}

export interface PerformanceMetrics {
  id: string;
  name: string;
  value: number;
  unit: 'ms' | 'bytes' | 'count' | 'percentage';
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface ErrorReport {
  id: string;
  error: {
    name: string;
    message: string;
    stack?: string;
    code?: string;
  };
  context: {
    url: string;
    userAgent: string;
    userId?: string;
    sessionId?: string;
    timestamp: string;
  };
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'new' | 'investigating' | 'resolved' | 'ignored';
  assignedTo?: string;
  resolvedAt?: string;
}

export enum StepType {
  CreateFile = 'create_file',
  CreateFolder = 'create_folder',
  EditFile = 'edit_file',
  DeleteFile = 'delete_file',
  RunScript = 'run_script',
  InstallDependency = 'install_dependency',
  ConfigureEnvironment = 'configure_environment',
  Deploy = 'deploy',
  Test = 'test',
  Build = 'build',
}

export interface TabConfig {
  id: string;
  label: string;
  icon?: string;
  component: string;
  permissions?: string[];
  order: number;
  visible: boolean;
}

export interface BuildInterfaceState {
  activeTab: string;
  selectedFile: ProjectFile | null;
  buildSession: BuildSession | null;
  loading: boolean;
  error: string | null;
  isBuilding: boolean;
  buildProgress: number;
  chatLoading: boolean;
  chatTimedOut: boolean;
  remainingSeconds: number;
}
