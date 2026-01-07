import { Request, Response, NextFunction } from 'express';
import { Logger } from 'tslog';
const logger = new Logger();
export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  if (err.status && err.message) {
    res.status(err.status).json({ error: err.message });
  } else if (err.message?.startsWith('Access denied')) {
    // Handle authorization errors - return 403 Forbidden
    res.status(403).json({ error: err.message });
  } else {
    console.log(err)
    logger.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
