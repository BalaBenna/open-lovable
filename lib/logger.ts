/**
 * Centralized logging utility for the application
 * Provides different log levels and conditional logging based on environment
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
  [key: string]: any;
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development';
  private isProduction = process.env.NODE_ENV === 'production';

  private shouldLog(level: LogLevel): boolean {
    if (this.isProduction && level === 'debug') return false;
    return true;
  }

  private formatMessage(level: LogLevel, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${level.toUpperCase()}]`;
    return context ? `${prefix} ${message}` : `${prefix} ${message}`;
  }

  debug(message: string, context?: LogContext): void {
    if (!this.shouldLog('debug')) return;
    console.debug(this.formatMessage('debug', message), context || '');
  }

  info(message: string, context?: LogContext): void {
    if (!this.shouldLog('info')) return;
    console.info(this.formatMessage('info', message), context || '');
  }

  warn(message: string, context?: LogContext): void {
    if (!this.shouldLog('warn')) return;
    console.warn(this.formatMessage('warn', message), context || '');
  }

  error(message: string, error?: Error, context?: LogContext): void {
    if (!this.shouldLog('error')) return;
    console.error(this.formatMessage('error', message), error || '', context || '');
  }

  // Specialized methods for common use cases
  apiCall(endpoint: string, method: string, duration?: number): void {
    this.info(`API Call: ${method} ${endpoint}`, duration ? { duration: `${duration}ms` } : undefined);
  }

  userAction(action: string, details?: LogContext): void {
    this.info(`User Action: ${action}`, details);
  }

  performance(metric: string, value: number, unit: string = 'ms'): void {
    this.info(`Performance: ${metric}`, { value, unit });
  }

  componentLifecycle(component: string, phase: string): void {
    if (!this.isDevelopment) return;
    this.debug(`Component ${component}: ${phase}`);
  }

  // Additional specialized methods
  navigation(from: string, to: string, details?: LogContext): void {
    this.info('Navigation', { from, to, ...details });
  }

  featureUsage(feature: string, action: string, details?: LogContext): void {
    this.info(`Feature Usage: ${feature}`, { action, ...details });
  }

  sandboxEvent(event: string, details?: LogContext): void {
    this.info(`Sandbox Event: ${event}`, details);
  }

  aiGeneration(type: string, status: 'start' | 'progress' | 'complete' | 'error', details?: LogContext): void {
    const level = status === 'error' ? 'error' : 'info';
    this[level](`AI Generation: ${type} - ${status}`, details);
  }

  websocketEvent(event: string, data?: any): void {
    this.debug(`WebSocket: ${event}`, data);
  }

  stateChange(component: string, prevState: any, newState: any): void {
    if (!this.isDevelopment) return;
    this.debug(`State Change: ${component}`, {
      previous: prevState,
      current: newState
    });
  }
}

// Export singleton instance
export const logger = new Logger();
export default logger;
