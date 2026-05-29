export interface LogPayload {
  severity: 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL';
  message: string;
  timestamp: string;
  [key: string]: any;
}

export const logger = {
  info: (message: string, meta?: Record<string, any>) => {
    const payload: LogPayload = {
      severity: 'INFO',
      message,
      timestamp: new Date().toISOString(),
      ...meta,
    };
    console.log(JSON.stringify(payload));
  },
  warn: (message: string, meta?: Record<string, any>) => {
    const payload: LogPayload = {
      severity: 'WARNING',
      message,
      timestamp: new Date().toISOString(),
      ...meta,
    };
    console.log(JSON.stringify(payload));
  },
  error: (message: string, meta?: Record<string, any>) => {
    const payload: LogPayload = {
      severity: 'ERROR',
      message,
      timestamp: new Date().toISOString(),
      ...meta,
    };
    console.log(JSON.stringify(payload));
  },
};
