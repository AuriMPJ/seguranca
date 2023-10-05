import { Request, Response, NextFunction } from 'express';

let requestCount = 0;
const MAX_REQUESTS = 5;

export const requestCounterMiddleware = (req: Request, res: Response, next: NextFunction) => {
  requestCount++;
  if (requestCount > MAX_REQUESTS) {
    res.status(429).json({ error: 'Limite máximo de chamadas atingido.' });
  } else {
    next();
  }
};