import { Request, Response, NextFunction } from 'express';
import { Logger } from 'tslog';

const logger = new Logger();

interface User {
    uuid: string;
    username: string;
    anonymous: boolean;
    roles: string[];
}

const handleError = (res: Response, status: number, logMessage: string, responseMessage: string) => {
    logger.error(logMessage);
    res.status(status).json({ status, message: responseMessage });
};

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const headerValue = req.header('X-USER');
    console.log(`[AUTH MIDDLEWARE] Path: ${req.path}, X-USER header: ${headerValue}`);
    try {
        const user: User = JSON.parse(headerValue as string);
        (req as any).user = user;
        console.log(`[AUTH MIDDLEWARE] User parsed successfully: ${JSON.stringify(user)}`);
        next();
    } catch (error) {
        console.log(`[AUTH MIDDLEWARE] Failed to parse X-USER header: ${error}`);
        const user ={
            anonymous: false,
            uuid: '0000-0000-0000-0000',
            username: 'anonymous',
            roles: [ ]
          };
          (req as any).user = user;
        next();
    }
};

export default authMiddleware;