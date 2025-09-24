// Enterprise configuration management service
import { EnterpriseConfig } from '../types/enterprise';
import { logger } from './Logger';

export class ConfigurationManager {
  private static instance: ConfigurationManager;
  private config: EnterpriseConfig;
  private environment: string;

  private constructor() {
    this.environment = process.env.NODE_ENV || 'development';
    this.config = this.loadDefaultConfig();
    this.loadEnvironmentConfig();
  }

  public static getInstance(): ConfigurationManager {
    if (!ConfigurationManager.instance) {
      ConfigurationManager.instance = new ConfigurationManager();
    }
    return ConfigurationManager.instance;
  }

  private loadDefaultConfig(): EnterpriseConfig {
    return {
      api: {
        baseUrl: 'http://localhost:3000',
        timeout: 30000,
        retryAttempts: 3,
        retryDelay: 1000,
      },
      features: {
        enableLogging: true,
        enableAnalytics: false,
        enableErrorReporting: true,
        enablePerformanceMonitoring: true,
      },
      ui: {
        theme: 'auto',
        language: 'en',
        timezone: 'UTC',
      },
      security: {
        enableCSP: true,
        enableCORS: true,
        allowedOrigins: ['http://localhost:3000', 'http://localhost:5173'],
      },
    };
  }

  private loadEnvironmentConfig(): void {
    try {
      // Load from environment variables
      const envConfig = this.parseEnvironmentVariables();
      this.config = this.mergeConfigs(this.config, envConfig);

      // Load from localStorage (user preferences)
      const userConfig = this.loadUserPreferences();
      this.config = this.mergeConfigs(this.config, userConfig);

      logger.info('Configuration loaded successfully', {
        environment: this.environment,
        features: this.config.features,
      });
    } catch (error) {
      logger.error('Failed to load configuration', { error });
    }
  }

  private parseEnvironmentVariables(): Partial<EnterpriseConfig> {
    const envConfig: Partial<EnterpriseConfig> = {};

    // API Configuration
    if (process.env.REACT_APP_API_BASE_URL) {
      envConfig.api = {
        ...envConfig.api,
        baseUrl: process.env.REACT_APP_API_BASE_URL,
      };
    }

    if (process.env.REACT_APP_API_TIMEOUT) {
      envConfig.api = {
        ...envConfig.api,
        timeout: parseInt(process.env.REACT_APP_API_TIMEOUT, 10),
      };
    }

    // Feature Flags
    if (process.env.REACT_APP_ENABLE_LOGGING !== undefined) {
      envConfig.features = {
        ...envConfig.features,
        enableLogging: process.env.REACT_APP_ENABLE_LOGGING === 'true',
      };
    }

    if (process.env.REACT_APP_ENABLE_ANALYTICS !== undefined) {
      envConfig.features = {
        ...envConfig.features,
        enableAnalytics: process.env.REACT_APP_ENABLE_ANALYTICS === 'true',
      };
    }

    if (process.env.REACT_APP_ENABLE_ERROR_REPORTING !== undefined) {
      envConfig.features = {
        ...envConfig.features,
        enableErrorReporting: process.env.REACT_APP_ENABLE_ERROR_REPORTING === 'true',
      };
    }

    if (process.env.REACT_APP_ENABLE_PERFORMANCE_MONITORING !== undefined) {
      envConfig.features = {
        ...envConfig.features,
        enablePerformanceMonitoring: process.env.REACT_APP_ENABLE_PERFORMANCE_MONITORING === 'true',
      };
    }

    // UI Configuration
    if (process.env.REACT_APP_THEME) {
      envConfig.ui = {
        ...envConfig.ui,
        theme: process.env.REACT_APP_THEME as 'light' | 'dark' | 'auto',
      };
    }

    if (process.env.REACT_APP_LANGUAGE) {
      envConfig.ui = {
        ...envConfig.ui,
        language: process.env.REACT_APP_LANGUAGE,
      };
    }

    if (process.env.REACT_APP_TIMEZONE) {
      envConfig.ui = {
        ...envConfig.ui,
        timezone: process.env.REACT_APP_TIMEZONE,
      };
    }

    return envConfig;
  }

  private loadUserPreferences(): Partial<EnterpriseConfig> {
    try {
      const stored = localStorage.getItem('user_preferences');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      logger.warn('Failed to load user preferences from localStorage', { error });
    }
    return {};
  }

  private mergeConfigs(base: EnterpriseConfig, override: Partial<EnterpriseConfig>): EnterpriseConfig {
    return {
      ...base,
      ...override,
      api: {
        ...base.api,
        ...override.api,
      },
      features: {
        ...base.features,
        ...override.features,
      },
      ui: {
        ...base.ui,
        ...override.ui,
      },
      security: {
        ...base.security,
        ...override.security,
      },
    };
  }

  public getConfig(): EnterpriseConfig {
    return { ...this.config };
  }

  public getApiConfig() {
    return { ...this.config.api };
  }

  public getFeatureConfig() {
    return { ...this.config.features };
  }

  public getUIConfig() {
    return { ...this.config.ui };
  }

  public getSecurityConfig() {
    return { ...this.config.security };
  }

  public updateConfig(updates: Partial<EnterpriseConfig>): void {
    this.config = this.mergeConfigs(this.config, updates);
    this.saveUserPreferences();
    logger.info('Configuration updated', { updates });
  }

  public updateUserPreferences(preferences: Partial<EnterpriseConfig>): void {
    this.config = this.mergeConfigs(this.config, preferences);
    this.saveUserPreferences();
    logger.info('User preferences updated', { preferences });
  }

  private saveUserPreferences(): void {
    try {
      const userPreferences = {
        ui: this.config.ui,
      };
      localStorage.setItem('user_preferences', JSON.stringify(userPreferences));
    } catch (error) {
      logger.warn('Failed to save user preferences to localStorage', { error });
    }
  }

  public isFeatureEnabled(feature: keyof EnterpriseConfig['features']): boolean {
    return this.config.features[feature];
  }

  public getEnvironment(): string {
    return this.environment;
  }

  public isDevelopment(): boolean {
    return this.environment === 'development';
  }

  public isProduction(): boolean {
    return this.environment === 'production';
  }

  public isTest(): boolean {
    return this.environment === 'test';
  }

  public resetToDefaults(): void {
    this.config = this.loadDefaultConfig();
    localStorage.removeItem('user_preferences');
    logger.info('Configuration reset to defaults');
  }
}

// Export singleton instance
export const configManager = ConfigurationManager.getInstance();
