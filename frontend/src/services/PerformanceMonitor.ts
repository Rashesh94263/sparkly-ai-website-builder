// Enterprise performance monitoring service
import { PerformanceMetrics } from '../types/enterprise';
import { logger } from './Logger';

export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: PerformanceMetrics[] = [];
  private maxMetrics = 500;
  private observers: PerformanceObserver[] = [];

  private constructor() {
    this.initializePerformanceObservers();
  }

  public static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  private initializePerformanceObservers(): void {
    // Monitor navigation timing
    if ('PerformanceObserver' in window) {
      try {
        const navigationObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry) => {
            if (entry.entryType === 'navigation') {
              this.recordMetric('navigation', entry.duration, 'ms', {
                type: entry.type,
                redirectCount: (entry as PerformanceNavigationTiming).redirectCount,
                loadEventEnd: (entry as PerformanceNavigationTiming).loadEventEnd,
                domContentLoaded: (entry as PerformanceNavigationTiming).domContentLoadedEventEnd,
              });
            }
          });
        });
        navigationObserver.observe({ entryTypes: ['navigation'] });
        this.observers.push(navigationObserver);
      } catch (error) {
        logger.warn('Navigation performance observer not supported', { error });
      }

      // Monitor resource timing
      try {
        const resourceObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry) => {
            if (entry.entryType === 'resource') {
              this.recordMetric('resource_load', entry.duration, 'ms', {
                name: entry.name,
                initiatorType: (entry as PerformanceResourceTiming).initiatorType,
                transferSize: (entry as PerformanceResourceTiming).transferSize,
                encodedBodySize: (entry as PerformanceResourceTiming).encodedBodySize,
              });
            }
          });
        });
        resourceObserver.observe({ entryTypes: ['resource'] });
        this.observers.push(resourceObserver);
      } catch (error) {
        logger.warn('Resource performance observer not supported', { error });
      }

      // Monitor paint timing
      try {
        const paintObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry) => {
            if (entry.entryType === 'paint') {
              this.recordMetric(`paint_${entry.name}`, entry.startTime, 'ms');
            }
          });
        });
        paintObserver.observe({ entryTypes: ['paint'] });
        this.observers.push(paintObserver);
      } catch (error) {
        logger.warn('Paint performance observer not supported', { error });
      }
    }
  }

  public recordMetric(
    name: string,
    value: number,
    unit: 'ms' | 'bytes' | 'count' | 'percentage',
    metadata?: Record<string, any>
  ): void {
    const metric: PerformanceMetrics = {
      id: this.generateId(),
      name,
      value,
      unit,
      timestamp: new Date().toISOString(),
      metadata,
    };

    this.metrics.push(metric);
    
    // Keep only the last maxMetrics entries
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics);
    }

    logger.debug(`Performance metric recorded: ${name} = ${value}${unit}`, { metric });
  }

  public measureAsync<T>(
    name: string,
    asyncFn: () => Promise<T>,
    metadata?: Record<string, any>
  ): Promise<T> {
    const startTime = performance.now();
    
    return asyncFn().then(
      (result) => {
        const duration = performance.now() - startTime;
        this.recordMetric(name, duration, 'ms', { ...metadata, success: true });
        return result;
      },
      (error) => {
        const duration = performance.now() - startTime;
        this.recordMetric(name, duration, 'ms', { ...metadata, success: false, error: error.message });
        throw error;
      }
    );
  }

  public measureSync<T>(
    name: string,
    syncFn: () => T,
    metadata?: Record<string, any>
  ): T {
    const startTime = performance.now();
    
    try {
      const result = syncFn();
      const duration = performance.now() - startTime;
      this.recordMetric(name, duration, 'ms', { ...metadata, success: true });
      return result;
    } catch (error) {
      const duration = performance.now() - startTime;
      this.recordMetric(name, duration, 'ms', { ...metadata, success: false, error: error.message });
      throw error;
    }
  }

  public startTimer(name: string): () => void {
    const startTime = performance.now();
    
    return () => {
      const duration = performance.now() - startTime;
      this.recordMetric(name, duration, 'ms');
    };
  }

  public getMetrics(name?: string, limit?: number): PerformanceMetrics[] {
    let filteredMetrics = this.metrics;
    
    if (name) {
      filteredMetrics = filteredMetrics.filter(metric => metric.name === name);
    }
    
    if (limit) {
      filteredMetrics = filteredMetrics.slice(-limit);
    }
    
    return filteredMetrics;
  }

  public getAverageMetric(name: string, timeWindow?: number): number | null {
    let filteredMetrics = this.metrics.filter(metric => metric.name === name);
    
    if (timeWindow) {
      const cutoffTime = Date.now() - timeWindow;
      filteredMetrics = filteredMetrics.filter(metric => 
        new Date(metric.timestamp).getTime() > cutoffTime
      );
    }
    
    if (filteredMetrics.length === 0) return null;
    
    const sum = filteredMetrics.reduce((acc, metric) => acc + metric.value, 0);
    return sum / filteredMetrics.length;
  }

  public getMetricStats(name: string, timeWindow?: number): {
    count: number;
    average: number;
    min: number;
    max: number;
    p95: number;
  } | null {
    let filteredMetrics = this.metrics.filter(metric => metric.name === name);
    
    if (timeWindow) {
      const cutoffTime = Date.now() - timeWindow;
      filteredMetrics = filteredMetrics.filter(metric => 
        new Date(metric.timestamp).getTime() > cutoffTime
      );
    }
    
    if (filteredMetrics.length === 0) return null;
    
    const values = filteredMetrics.map(metric => metric.value).sort((a, b) => a - b);
    const count = values.length;
    const average = values.reduce((acc, val) => acc + val, 0) / count;
    const min = values[0];
    const max = values[count - 1];
    const p95Index = Math.floor(count * 0.95);
    const p95 = values[p95Index];
    
    return { count, average, min, max, p95 };
  }

  public clearMetrics(): void {
    this.metrics = [];
  }

  public exportMetrics(): string {
    return JSON.stringify(this.metrics, null, 2);
  }

  public destroy(): void {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
  }

  private generateId(): string {
    return `perf_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Export singleton instance
export const performanceMonitor = PerformanceMonitor.getInstance();
