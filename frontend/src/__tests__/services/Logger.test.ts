// Enterprise Logger Service Tests
import { Logger } from '../../services/Logger';

describe('Logger', () => {
  let logger: Logger;

  beforeEach(() => {
    logger = Logger.getInstance();
    logger.clearLogs();
  });

  describe('Singleton Pattern', () => {
    it('should return the same instance', () => {
      const instance1 = Logger.getInstance();
      const instance2 = Logger.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('Logging Methods', () => {
    it('should log debug messages', () => {
      const consoleSpy = jest.spyOn(console, 'debug').mockImplementation(() => {});
      
      logger.debug('Test debug message', { test: true });
      
      expect(consoleSpy).toHaveBeenCalledWith(
        '[DEBUG] Test debug message',
        { test: true }
      );
      
      consoleSpy.mockRestore();
    });

    it('should log info messages', () => {
      const consoleSpy = jest.spyOn(console, 'info').mockImplementation(() => {});
      
      logger.info('Test info message', { test: true });
      
      expect(consoleSpy).toHaveBeenCalledWith(
        '[INFO] Test info message',
        { test: true }
      );
      
      consoleSpy.mockRestore();
    });

    it('should log warn messages', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
      
      logger.warn('Test warn message', { test: true });
      
      expect(consoleSpy).toHaveBeenCalledWith(
        '[WARN] Test warn message',
        { test: true }
      );
      
      consoleSpy.mockRestore();
    });

    it('should log error messages', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      logger.error('Test error message', { test: true });
      
      expect(consoleSpy).toHaveBeenCalledWith(
        '[ERROR] Test error message',
        { test: true }
      );
      
      consoleSpy.mockRestore();
    });

    it('should log fatal messages', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      logger.fatal('Test fatal message', { test: true });
      
      expect(consoleSpy).toHaveBeenCalledWith(
        '[FATAL] Test fatal message',
        { test: true }
      );
      
      consoleSpy.mockRestore();
    });
  });

  describe('Log Storage', () => {
    it('should store logs internally', () => {
      logger.info('Test message');
      
      const logs = logger.getLogs();
      expect(logs).toHaveLength(1);
      expect(logs[0].message).toBe('Test message');
      expect(logs[0].level).toBe('info');
    });

    it('should limit stored logs to maxLogs', () => {
      // Create more logs than the max limit
      for (let i = 0; i < 1001; i++) {
        logger.info(`Test message ${i}`);
      }
      
      const logs = logger.getLogs();
      expect(logs.length).toBeLessThanOrEqual(1000);
    });

    it('should filter logs by level', () => {
      logger.debug('Debug message');
      logger.info('Info message');
      logger.error('Error message');
      
      const errorLogs = logger.getLogs('error');
      expect(errorLogs).toHaveLength(1);
      expect(errorLogs[0].message).toBe('Error message');
    });

    it('should limit returned logs', () => {
      for (let i = 0; i < 10; i++) {
        logger.info(`Test message ${i}`);
      }
      
      const logs = logger.getLogs(undefined, 5);
      expect(logs).toHaveLength(5);
    });
  });

  describe('Enable/Disable', () => {
    it('should not log when disabled', () => {
      logger.disable();
      const consoleSpy = jest.spyOn(console, 'info').mockImplementation(() => {});
      
      logger.info('Test message');
      
      expect(consoleSpy).not.toHaveBeenCalled();
      
      consoleSpy.mockRestore();
      logger.enable();
    });

    it('should log when enabled', () => {
      logger.enable();
      const consoleSpy = jest.spyOn(console, 'info').mockImplementation(() => {});
      
      logger.info('Test message');
      
      expect(consoleSpy).toHaveBeenCalled();
      
      consoleSpy.mockRestore();
    });
  });

  describe('Export Functionality', () => {
    it('should export logs as JSON', () => {
      logger.info('Test message 1');
      logger.error('Test message 2');
      
      const exported = logger.exportLogs();
      const parsed = JSON.parse(exported);
      
      expect(parsed).toHaveLength(2);
      expect(parsed[0].message).toBe('Test message 1');
      expect(parsed[1].message).toBe('Test message 2');
    });
  });

  describe('Clear Functionality', () => {
    it('should clear all logs', () => {
      logger.info('Test message');
      expect(logger.getLogs()).toHaveLength(1);
      
      logger.clearLogs();
      expect(logger.getLogs()).toHaveLength(0);
    });
  });
});



