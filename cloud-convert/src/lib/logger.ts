// Structured Logger Utility

export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
}

export interface LogContext {
  userId?: number;
  requestId?: string;
  service?: string;
  duration?: number;
  [key: string]: any;
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development';
  private logLevel: LogLevel =
    (process.env.LOG_LEVEL as LogLevel) || LogLevel.INFO;

  /**
   * Log debug message
   */
  debug(message: string, context?: LogContext): void {
    if (this.shouldLog(LogLevel.DEBUG)) {
      this.log(LogLevel.DEBUG, message, context);
    }
  }

  /**
   * Log info message
   */
  info(message: string, context?: LogContext): void {
    if (this.shouldLog(LogLevel.INFO)) {
      this.log(LogLevel.INFO, message, context);
    }
  }

  /**
   * Log warning message
   */
  warn(message: string, context?: LogContext): void {
    if (this.shouldLog(LogLevel.WARN)) {
      this.log(LogLevel.WARN, message, context);
    }
  }

  /**
   * Log error message
   */
  error(message: string, error?: Error, context?: LogContext): void {
    if (this.shouldLog(LogLevel.ERROR)) {
      const errorContext = {
        ...context,
        error: error
          ? {
              message: error.message,
              stack: error.stack,
              name: error.name,
            }
          : undefined,
      };
      this.log(LogLevel.ERROR, message, errorContext);
    }
  }

  /**
   * Log API request
   */
  logRequest(
    method: string,
    path: string,
    statusCode: number,
    duration: number,
    context?: LogContext
  ): void {
    const emoji = this.getStatusEmoji(statusCode);
    this.info(`${emoji} ${method} ${path} - ${statusCode}`, {
      ...context,
      method,
      path,
      statusCode,
      duration,
    });
  }

  /**
   * Log conversion operation
   */
  logConversion(
    userId: number,
    inputFormat: string,
    outputFormat: string,
    fileSize: number,
    duration: number
  ): void {
    this.info(`🔄 Conversion: ${inputFormat} → ${outputFormat}`, {
      userId,
      inputFormat,
      outputFormat,
      fileSize,
      duration,
      service: 'convert',
    });
  }

  /**
   * Log payment event
   */
  logPayment(
    userId: number,
    amount: number,
    status: string,
    productId?: string
  ): void {
    const emoji = status === 'succeeded' ? '💳' : '❌';
    this.info(`${emoji} Payment ${status}: $${(amount / 100).toFixed(2)}`, {
      userId,
      amount,
      status,
      productId,
      service: 'payment',
    });
  }

  /**
   * Log token operation
   */
  logTokenOperation(
    userId: number,
    operation: 'grant' | 'deduct' | 'reset',
    amount: number,
    remaining: number
  ): void {
    const emoji = operation === 'grant' ? '➕' : operation === 'deduct' ? '➖' : '🔄';
    this.info(`${emoji} Token ${operation}: ${amount} (remaining: ${remaining})`, {
      userId,
      operation,
      amount,
      remaining,
      service: 'token',
    });
  }

  /**
   * Log rate limit event
   */
  logRateLimit(
    userId: number,
    remaining: number,
    limit: number,
    resetAt: Date
  ): void {
    const percentage = Math.round((remaining / limit) * 100);
    const emoji = percentage < 20 ? '⚠️' : '✅';

    this.info(`${emoji} Rate limit: ${remaining}/${limit} (${percentage}%)`, {
      userId,
      remaining,
      limit,
      resetAt: resetAt.toISOString(),
      service: 'rateLimit',
    });
  }

  /**
   * Check if should log at this level
   */
  private shouldLog(level: LogLevel): boolean {
    const levels = [LogLevel.DEBUG, LogLevel.INFO, LogLevel.WARN, LogLevel.ERROR];
    const currentLevelIndex = levels.indexOf(this.logLevel);
    const messageLevelIndex = levels.indexOf(level);
    return messageLevelIndex >= currentLevelIndex;
  }

  /**
   * Core log function
   */
  private log(level: LogLevel, message: string, context?: LogContext): void {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      message,
      ...context,
    };

    // In development, use pretty console output
    if (this.isDevelopment) {
      const color = this.getLogColor(level);
      console.log(`${color}[${timestamp}] [${level}]${this.resetColor} ${message}`);
      if (context && Object.keys(context).length > 0) {
        console.log('  Context:', context);
      }
    } else {
      // In production, use JSON for log aggregation tools
      console.log(JSON.stringify(logEntry));
    }
  }

  /**
   * Get color for log level (terminal colors)
   */
  private getLogColor(level: LogLevel): string {
    switch (level) {
      case LogLevel.DEBUG:
        return '\x1b[36m'; // Cyan
      case LogLevel.INFO:
        return '\x1b[32m'; // Green
      case LogLevel.WARN:
        return '\x1b[33m'; // Yellow
      case LogLevel.ERROR:
        return '\x1b[31m'; // Red
      default:
        return '';
    }
  }

  private get resetColor(): string {
    return '\x1b[0m';
  }

  /**
   * Get emoji for HTTP status code
   */
  private getStatusEmoji(statusCode: number): string {
    if (statusCode >= 200 && statusCode < 300) return '✅';
    if (statusCode >= 300 && statusCode < 400) return '↪️';
    if (statusCode >= 400 && statusCode < 500) return '⚠️';
    if (statusCode >= 500) return '❌';
    return '❓';
  }
}

// Export singleton instance
export const logger = new Logger();
