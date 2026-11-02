import { Response } from 'express';
import { ApiResponse } from '@portfolio/shared';

export function sendSuccess<T>(
  res: Response,
  data: T,
  statusCode = 200,
  extraMeta: Record<string, any> = {}
): void {
  const payload: ApiResponse<T> = {
    success: true,
    data,
    meta: {
      timestamp: new Date().toISOString(),
      ...extraMeta
    }
  };
  res.status(statusCode).json(payload);
}

export function sendError(
  res: Response,
  code: string,
  message: string,
  statusCode = 400,
  details?: Array<{ field?: string; issue: string }>
): void {
  const payload: ApiResponse = {
    success: false,
    error: {
      code,
      message,
      ...(details && details.length > 0 ? { details } : {})
    },
    meta: {
      timestamp: new Date().toISOString()
    }
  };
  res.status(statusCode).json(payload);
}
