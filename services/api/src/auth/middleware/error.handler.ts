import { Request, Response, NextFunction } from 'express';
import { Logger } from 'tslog';
const logger = new Logger();
export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  if (err.status && err.message) {
    res.status(err.status).json({ error: err.message });
  } else {
    logger.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
