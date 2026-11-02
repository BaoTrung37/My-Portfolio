import { Request, Response, NextFunction } from 'express';
import { sendError } from './response.js';

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
): void {
  // Handle payload too large
  if (err.type === 'entity.too.large' || err.status === 413) {
    sendError(res, 'PAYLOAD_TOO_LARGE', 'Request payload exceeds 64KB limit', 413);
    return;
  }

  // Handle malformed JSON body
  if (err instanceof SyntaxError && 'body' in err) {
    sendError(res, 'INVALID_JSON', 'Malformed JSON in request body', 400);
    return;
  }

  // Handle generic error
  const statusCode = typeof err.statusCode === 'number' ? err.statusCode : 500;
  const message = err.message || 'An unexpected internal server error occurred';
  const code = err.code || (statusCode === 500 ? 'INTERNAL_SERVER_ERROR' : 'BAD_REQUEST');

  console.error('[Error Handler]', err);
  sendError(res, code, message, statusCode, err.details);
}
