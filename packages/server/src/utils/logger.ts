import pino from 'pino';
import { NODE_ENV } from '../config';
import { Request, Response } from 'express';

// Extend the Express Response type to include our custom properties
declare module 'express' {
  interface Response {
    responseTime?: number;
  }
}

// Configure the logger options
const loggerOptions = {
  level: NODE_ENV === 'development' ? 'debug' : 'info',
  redact: {
    paths: [
      'req.headers.authorization',
      'req.headers.cookie',
      'password',
      'token',
      'apiKey',
      'secret',
    ],
    censor: '[REDACTED]',
  },
  transport:
    NODE_ENV === 'development'
      ? {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'SYS:standard',
            ignore: 'pid,hostname',
          },
        }
      : undefined,
  base: {
    env: NODE_ENV,
  },
  timestamp: pino.stdTimeFunctions.isoTime,
  formatters: {
    level: (label: string) => {
      return { level: label.toUpperCase() };
    },
  },
};

// Create the logger
const logger = pino(loggerOptions);

// Utility function for HTTP request logging
export const httpLogger = (req: Request, res: Response, responseBody?: unknown) => {
  const logObject = {
    req: {
      method: req.method,
      url: req.originalUrl || req.url,
      params: req.params,
      query: req.query,
      // Don't log entire bodies to avoid sensitive data
      body: req.method === 'GET' ? undefined : '[BODY]',
      headers: req.headers,
      ip: req.ip || req.connection?.remoteAddress,
    },
    res: {
      statusCode: res.statusCode,
      responseTime: res.responseTime,
      contentLength: res.get ? res.get('content-length') : undefined,
    },
    responseBodySample: responseBody
      ? // Only log a brief preview of the response body to avoid sensitive data and excessive logging
        typeof responseBody === 'string'
        ? responseBody.substring(0, 100) + (responseBody.length > 100 ? '...' : '')
        : '[RESPONSE_BODY]'
      : undefined,
  };

  // Log at appropriate level based on status code
  if (res.statusCode >= 500) {
    logger.error(logObject, `HTTP ${res.statusCode} ${req.method} ${req.originalUrl || req.url}`);
  } else if (res.statusCode >= 400) {
    logger.warn(logObject, `HTTP ${res.statusCode} ${req.method} ${req.originalUrl || req.url}`);
  } else if (res.statusCode >= 300) {
    logger.info(logObject, `HTTP ${res.statusCode} ${req.method} ${req.originalUrl || req.url}`);
  } else {
    logger.debug(logObject, `HTTP ${res.statusCode} ${req.method} ${req.originalUrl || req.url}`);
  }
};

// Options for the request logger middleware
interface RequestLoggerOptions {
  [key: string]: unknown;
}

// Create middleware for Express request logging
export const requestLogger = (options: RequestLoggerOptions = {}) => {
  return (req: Request, res: Response, next: (err?: Error) => void) => {
    // Record the start time
    const startTime = Date.now();

    // No need for both originalEnd and endFn variables

    // Override the end method
    const endFn = res.end;
    res.end = function (
      this: Response,
      chunk: any,
      encodingOrCb?: BufferEncoding | (() => void),
      cb?: () => void
    ): Response {
      // Calculate the response time
      res.responseTime = Date.now() - startTime;

      // Log the request/response before ending
      httpLogger(req, res);

      // Call the original end method with the right arguments
      return endFn.apply(this, arguments as any);
    } as any;

    next();
  };
};

export default logger;
