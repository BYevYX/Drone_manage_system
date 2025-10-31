/**
 * Система логирования
 */

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: Record<string, unknown>;
  error?: Error;
}

export interface LoggerConfig {
  level: LogLevel;
  enableConsole: boolean;
  enableRemote: boolean;
  remoteEndpoint?: string;
  maxEntries: number;
}

class Logger {
  private config: LoggerConfig;
  private entries: LogEntry[] = [];

  constructor(config: Partial<LoggerConfig> = {}) {
    this.config = {
      level: process.env.NODE_ENV === 'development' ? LogLevel.DEBUG : LogLevel.INFO,
      enableConsole: true,
      enableRemote: process.env.NODE_ENV === 'production',
      remoteEndpoint: '/api/logs',
      maxEntries: 1000,
      ...config,
    };
  }

  private shouldLog(level: LogLevel): boolean {
    return level >= this.config.level;
  }

  private createLogEntry(
    level: LogLevel,
    message: string,
    context?: Record<string, unknown>,
    error?: Error,
  ): LogEntry {
    return {
      level,
      message,
      timestamp: new Date().toISOString(),
      context,
      error,
    };
  }

  private formatMessage(entry: LogEntry): string {
    const levelName = LogLevel[entry.level];
    const contextStr = entry.context ? ` ${JSON.stringify(entry.context)}` : '';
    const errorStr = entry.error ? ` Error: ${entry.error.message}` : '';
    
    return `[${entry.timestamp}] ${levelName}: ${entry.message}${contextStr}${errorStr}`;
  }

  private logToConsole(entry: LogEntry): void {
    if (!this.config.enableConsole) return;

    const message = this.formatMessage(entry);
    
    switch (entry.level) {
      case LogLevel.DEBUG:
        console.debug(message, entry.context, entry.error);
        break;
      case LogLevel.INFO:
        console.info(message, entry.context, entry.error);
        break;
      case LogLevel.WARN:
        console.warn(message, entry.context, entry.error);
        break;
      case LogLevel.ERROR:
        console.error(message, entry.context, entry.error);
        break;
    }
  }

  private async logToRemote(entry: LogEntry): Promise<void> {
    if (!this.config.enableRemote || !this.config.remoteEndpoint) return;

    try {
      await fetch(this.config.remoteEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(entry),
      });
    } catch (error) {
      console.error('Failed to send log to remote endpoint:', error);
    }
  }

  private addEntry(entry: LogEntry): void {
    this.entries.push(entry);
    
    // Ограничиваем количество записей в памяти
    if (this.entries.length > this.config.maxEntries) {
      this.entries = this.entries.slice(-this.config.maxEntries);
    }
  }

  private log(
    level: LogLevel,
    message: string,
    context?: Record<string, unknown>,
    error?: Error,
  ): void {
    if (!this.shouldLog(level)) return;

    const entry = this.createLogEntry(level, message, context, error);
    
    this.addEntry(entry);
    this.logToConsole(entry);
    
    if (this.config.enableRemote) {
      this.logToRemote(entry).catch(() => {
        // Игнорируем ошибки отправки логов
      });
    }
  }

  debug(message: string, context?: Record<string, unknown>): void {
    this.log(LogLevel.DEBUG, message, context);
  }

  info(message: string, context?: Record<string, unknown>): void {
    this.log(LogLevel.INFO, message, context);
  }

  warn(message: string, context?: Record<string, unknown>): void {
    this.log(LogLevel.WARN, message, context);
  }

  error(message: string, error?: Error, context?: Record<string, unknown>): void {
    this.log(LogLevel.ERROR, message, context, error);
  }

  // Специальные методы для различных типов событий
  apiCall(method: string, url: string, duration?: number, status?: number): void {
    this.info('API Call', {
      method,
      url,
      duration,
      status,
      type: 'api_call',
    });
  }

  userAction(action: string, details?: Record<string, unknown>): void {
    this.info('User Action', {
      action,
      ...details,
      type: 'user_action',
    });
  }

  performance(name: string, duration: number, details?: Record<string, unknown>): void {
    this.info('Performance Metric', {
      name,
      duration,
      ...details,
      type: 'performance',
    });
  }

  // Методы для управления логгером
  setLevel(level: LogLevel): void {
    this.config.level = level;
  }

  getEntries(level?: LogLevel): LogEntry[] {
    if (level !== undefined) {
      return this.entries.filter(entry => entry.level >= level);
    }
    return [...this.entries];
  }

  clearEntries(): void {
    this.entries = [];
  }

  exportLogs(): string {
    return this.entries.map(entry => this.formatMessage(entry)).join('\n');
  }

  // Метод для отправки всех накопленных логов
  async flushLogs(): Promise<void> {
    if (!this.config.enableRemote || !this.config.remoteEndpoint) return;

    const logsToSend = this.getEntries();
    if (logsToSend.length === 0) return;

    try {
      await fetch(`${this.config.remoteEndpoint}/batch`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ logs: logsToSend }),
      });
      
      this.clearEntries();
    } catch (error) {
      console.error('Failed to flush logs:', error);
    }
  }
}

// Создаем глобальный экземпляр логгера
export const logger = new Logger();

// Утилиты для логирования производительности
export const measurePerformance = (name: string) => {
  const startTime = performance.now();
  
  return () => {
    const duration = performance.now() - startTime;
    logger.performance(name, duration);
    return duration;
  };
};

// Декоратор для логирования вызовов методов
export const logMethodCalls = (target: any, propertyName: string, descriptor: PropertyDescriptor) => {
  const method = descriptor.value;
  
  descriptor.value = function (...args: any[]) {
    const className = target.constructor.name;
    logger.debug(`Method call: ${className}.${propertyName}`, { args });
    
    try {
      const result = method.apply(this, args);
      
      if (result instanceof Promise) {
        return result.catch((error: Error) => {
          logger.error(`Method error: ${className}.${propertyName}`, error, { args });
          throw error;
        });
      }
      
      return result;
    } catch (error) {
      logger.error(`Method error: ${className}.${propertyName}`, error as Error, { args });
      throw error;
    }
  };
  
  return descriptor;
};

// Глобальные обработчики ошибок
if (typeof window !== 'undefined') {
  // Обработчик необработанных ошибок
  window.addEventListener('error', (event) => {
    logger.error('Unhandled Error', event.error, {
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      type: 'unhandled_error',
    });
  });

  // Обработчик необработанных промисов
  window.addEventListener('unhandledrejection', (event) => {
    logger.error('Unhandled Promise Rejection', event.reason, {
      type: 'unhandled_rejection',
    });
  });
}