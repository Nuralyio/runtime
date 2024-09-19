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
    const headerValue = req.header('X-USER') ?? undefined;

    if (!headerValue) {
        // return handleError(res, 401, "No authorization header provided. Please include a Bearer token in the Authorization header.", 'No authorization header provided. Please include a Bearer token in the Authorization header.');
    }

    try {
        const user: User = JSON.parse(headerValue as string);
        (req as any).user = user;
        next();
    } catch (error) {
        // return handleError(res, 400, "Invalid user data in header. Please ensure the user data is correctly formatted.", 'Invalid user data in header. Please ensure the user data is correctly formatted.');
    }
    next();

};

export default authMiddleware;