import { Request, Response, NextFunction } from 'express';
import { config } from '../config/env.js';

export function corsMiddleware(req: Request, res: Response, next: NextFunction): void {
  const allowedOrigin = config.corsOrigin;
  const origin = req.headers.origin;

  if (origin && (allowedOrigin === '*' || origin === allowedOrigin || allowedOrigin.split(',').includes(origin))) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else {
    res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
  }

  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.setHeader('Access-Control-Max-Age', '86400');

  if (req.method === 'OPTIONS') {
    res.sendStatus(204);
    return;
  }

  next();
}
