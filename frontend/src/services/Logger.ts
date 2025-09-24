// Enterprise logging service
import { LogEntry, LogLevel } from '../types/enterprise';

export class Logger {
  private static instance: Logger;
  private logs: LogEntry[] = [];
  private maxLogs = 1000;
  private isEnabled: boolean;

  private constructor() {
    this.isEnabled = true;
  }

  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  public enable(): void {
    this.isEnabled = true;
  }

  public disable(): void {
    this.isEnabled = false;
  }

  public debug(message: string, context?: Record<string, any>): void {
    this.log('debug', message, context);
  }

  public info(message: string, context?: Record<string, any>): void {
    this.log('info', message, context);
  }

  public warn(message: string, context?: Record<string, any>): void {
    this.log('warn', message, context);
  }

  public error(message: string, context?: Record<string, any>): void {
    this.log('error', message, context);
  }

  public fatal(message: string, context?: Record<string, any>): void {
    this.log('fatal', message, context);
  }

  private log(level: LogLevel, message: string, context?: Record<string, any>): void {
    if (!this.isEnabled) return;

    const logEntry: LogEntry = {
      id: this.generateId(),
      level,
      message,
      context,
      timestamp: new Date().toISOString(),
      userId: this.getCurrentUserId(),
      sessionId: this.getCurrentSessionId(),
    };

    this.logs.push(logEntry);
    
    // Keep only the last maxLogs entries
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    // Console output for development
    if (process.env.NODE_ENV === 'development') {
      const consoleMethod = this.getConsoleMethod(level);
      consoleMethod(`[${level.toUpperCase()}] ${message}`, context || '');
    }

    // Send to external logging service in production
    if (process.env.NODE_ENV === 'production') {
      this.sendToExternalService(logEntry);
    }
  }

  private getConsoleMethod(level: LogLevel): (...args: any[]) => void {
    switch (level) {
      case 'debug':
        return console.debug;
      case 'info':
        return console.info;
      case 'warn':
        return console.warn;
      case 'error':
        return console.error;
      case 'fatal':
        return console.error;
      default:
        return console.log;
    }
  }

  private async sendToExternalService(logEntry: LogEntry): Promise<void> {
    try {
      // In a real enterprise setup, this would send to services like:
      // - Splunk
      // - ELK Stack
      // - DataDog
      // - New Relic
      // - CloudWatch
      
      // For now, we'll just store in localStorage for demo
      const existingLogs = JSON.parse(localStorage.getItem('enterprise_logs') || '[]');
      existingLogs.push(logEntry);
      localStorage.setItem('enterprise_logs', JSON.stringify(existingLogs.slice(-100))); // Keep last 100
    } catch (error) {
      console.error('Failed to send log to external service:', error);
    }
  }

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private getCurrentUserId(): string | undefined {
    // In a real app, this would come from auth context
    return localStorage.getItem('userId') || undefined;
  }

  private getCurrentSessionId(): string | undefined {
    // In a real app, this would come from session management
    return localStorage.getItem('sessionId') || undefined;
  }

  public getLogs(level?: LogLevel, limit?: number): LogEntry[] {
    let filteredLogs = this.logs;
    
    if (level) {
      filteredLogs = filteredLogs.filter(log => log.level === level);
    }
    
    if (limit) {
      filteredLogs = filteredLogs.slice(-limit);
    }
    
    return filteredLogs;
  }

  public clearLogs(): void {
    this.logs = [];
  }

  public exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }
}

// Export singleton instance
export const logger = Logger.getInstance();
