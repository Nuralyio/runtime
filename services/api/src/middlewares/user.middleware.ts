import { Request, Response, NextFunction } from 'express';
import { Logger } from 'tslog';

const logger = new Logger();

interface User {
    uuid: string;
    username: string;
    anonymous: boolean;
    roles: string[];
}

// Configuration for trusted gateway
const TRUSTED_GATEWAY_SECRET = process.env.TRUSTED_GATEWAY_SECRET;
const ENFORCE_GATEWAY_VALIDATION = process.env.ENFORCE_GATEWAY_VALIDATION === 'true';

// Anonymous user constant
const ANONYMOUS_USER: User = {
    anonymous: true,
    uuid: '00000000-0000-0000-0000-000000000000',
    username: 'anonymous',
    roles: []
};

const handleError = (res: Response, status: number, logMessage: string, responseMessage: string) => {
    logger.error(logMessage);
    res.status(status).json({ status, message: responseMessage });
};

/**
 * Validates that the X-USER header comes from a trusted gateway.
 * Uses a shared secret passed via X-GATEWAY-SECRET header.
 */
const validateGatewayOrigin = (req: Request): boolean => {
    if (!ENFORCE_GATEWAY_VALIDATION) {
        return true;
    }

    if (!TRUSTED_GATEWAY_SECRET) {
        logger.warn('[AUTH MIDDLEWARE] TRUSTED_GATEWAY_SECRET not configured but validation is enforced');
        return false;
    }

    const gatewaySecret = req.header('X-GATEWAY-SECRET');
    return gatewaySecret === TRUSTED_GATEWAY_SECRET;
};

/**
 * Validates the structure of the parsed user object.
 */
const isValidUserObject = (user: any): user is User => {
    return (
        typeof user === 'object' &&
        user !== null &&
        typeof user.uuid === 'string' &&
        user.uuid.length > 0 &&
        typeof user.anonymous === 'boolean' &&
        Array.isArray(user.roles)
    );
};

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const headerValue = req.header('X-USER');
    console.log(`[AUTH MIDDLEWARE] Path: ${req.path}, X-USER header present: ${!!headerValue}`);

    // P0-1: Validate gateway origin when X-USER header is present
    if (headerValue && !validateGatewayOrigin(req)) {
        logger.warn(`[AUTH MIDDLEWARE] Rejected X-USER header from untrusted source: ${req.ip}`);
        return handleError(res, 403,
            `Untrusted gateway attempt from ${req.ip}`,
            'Forbidden: Invalid gateway credentials'
        );
    }

    try {
        if (!headerValue) {
            throw new Error('No X-USER header');
        }

        const user: User = JSON.parse(headerValue);

        // Validate user object structure
        if (!isValidUserObject(user)) {
            throw new Error('Invalid user object structure');
        }

        (req as any).user = user;
        console.log(`[AUTH MIDDLEWARE] User authenticated: ${user.uuid}`);
        next();
    } catch (error) {
        console.log(`[AUTH MIDDLEWARE] Using anonymous user: ${error}`);
        // P0-2: Fixed - anonymous flag is now correctly set to true
        (req as any).user = { ...ANONYMOUS_USER };
        next();
    }
};

export default authMiddleware;