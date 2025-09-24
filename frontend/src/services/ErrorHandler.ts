// Enterprise error handling service
import { ErrorReport } from '../types/enterprise';
import { logger } from './Logger';

export class ErrorHandler {
  private static instance: ErrorHandler;
  private errorReports: ErrorReport[] = [];
  private maxReports = 100;

  private constructor() {
    this.setupGlobalErrorHandlers();
  }

  public static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler();
    }
    return ErrorHandler.instance;
  }

  private setupGlobalErrorHandlers(): void {
    // Handle uncaught errors
    window.addEventListener('error', (event) => {
      this.handleError(event.error, {
        type: 'uncaught',
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      });
    });

    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.handleError(event.reason, {
        type: 'unhandledRejection',
        promise: event.promise,
      });
    });
  }

  public handleError(
    error: Error | any,
    context: Record<string, any> = {},
    severity: 'low' | 'medium' | 'high' | 'critical' = 'medium'
  ): ErrorReport {
    const errorReport: ErrorReport = {
      id: this.generateId(),
      error: {
        name: error?.name || 'UnknownError',
        message: error?.message || String(error),
        stack: error?.stack,
        code: error?.code,
      },
      context: {
        url: window.location.href,
        userAgent: navigator.userAgent,
        userId: this.getCurrentUserId(),
        sessionId: this.getCurrentSessionId(),
        timestamp: new Date().toISOString(),
        ...context,
      },
      severity,
      status: 'new',
    };

    this.errorReports.push(errorReport);
    
    // Keep only the last maxReports entries
    if (this.errorReports.length > this.maxReports) {
      this.errorReports = this.errorReports.slice(-this.maxReports);
    }

    // Log the error
    logger.error(`Error occurred: ${errorReport.error.message}`, {
      errorId: errorReport.id,
      severity: errorReport.severity,
      context: errorReport.context,
    });

    // Send to external error reporting service
    this.sendToErrorReportingService(errorReport);

    return errorReport;
  }

  public handleAsyncError<T>(
    asyncFn: () => Promise<T>,
    context: Record<string, any> = {},
    severity: 'low' | 'medium' | 'high' | 'critical' = 'medium'
  ): Promise<T> {
    return asyncFn().catch((error) => {
      this.handleError(error, context, severity);
      throw error; // Re-throw to maintain error flow
    });
  }

  public handleSyncError<T>(
    syncFn: () => T,
    context: Record<string, any> = {},
    severity: 'low' | 'medium' | 'high' | 'critical' = 'medium'
  ): T | null {
    try {
      return syncFn();
    } catch (error) {
      this.handleError(error, context, severity);
      return null;
    }
  }

  private async sendToErrorReportingService(errorReport: ErrorReport): Promise<void> {
    try {
      // In a real enterprise setup, this would send to services like:
      // - Sentry
      // - Bugsnag
      // - Rollbar
      // - LogRocket
      // - DataDog
      
      // For now, we'll just store in localStorage for demo
      const existingReports = JSON.parse(localStorage.getItem('error_reports') || '[]');
      existingReports.push(errorReport);
      localStorage.setItem('error_reports', JSON.stringify(existingReports.slice(-50))); // Keep last 50
    } catch (error) {
      logger.error('Failed to send error report to external service:', { error });
    }
  }

  private generateId(): string {
    return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getCurrentUserId(): string | undefined {
    return localStorage.getItem('userId') || undefined;
  }

  private getCurrentSessionId(): string | undefined {
    return localStorage.getItem('sessionId') || undefined;
  }

  public getErrorReports(severity?: string, status?: string): ErrorReport[] {
    let filteredReports = this.errorReports;
    
    if (severity) {
      filteredReports = filteredReports.filter(report => report.severity === severity);
    }
    
    if (status) {
      filteredReports = filteredReports.filter(report => report.status === status);
    }
    
    return filteredReports;
  }

  public updateErrorStatus(errorId: string, status: ErrorReport['status'], assignedTo?: string): boolean {
    const report = this.errorReports.find(r => r.id === errorId);
    if (report) {
      report.status = status;
      if (assignedTo) {
        report.assignedTo = assignedTo;
      }
      if (status === 'resolved') {
        report.resolvedAt = new Date().toISOString();
      }
      return true;
    }
    return false;
  }

  public clearErrorReports(): void {
    this.errorReports = [];
  }

  public exportErrorReports(): string {
    return JSON.stringify(this.errorReports, null, 2);
  }
}

// Export singleton instance
export const errorHandler = ErrorHandler.getInstance();
