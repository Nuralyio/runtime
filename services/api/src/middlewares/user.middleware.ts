import { Request, Response, NextFunction } from 'express';
import { Logger } from 'tslog';
import { UserService } from '../auth/application/user.service';
import { UserRepositoryPrismaPgSQL } from '../auth/infrastructure/user.repository';
import { KeycloakUserInfo } from '../auth/domain/interfaces/user.interface';

const logger = new Logger();

// Initialize user service for JIT provisioning
const userRepository = new UserRepositoryPrismaPgSQL();
const userService = new UserService(userRepository);

interface GatewayUser {
    uuid: string;
    username: string;
    email?: string;
    last_name?: string;
    anonymous: boolean;
    roles: string[];
}

interface RequestUser {
    uuid: string;
    username: string;
    email?: string;
    anonymous: boolean;
    roles: string[];
    dbUserId?: string;  // Internal database user ID
}

// Configuration for trusted gateway
const TRUSTED_GATEWAY_SECRET = process.env.TRUSTED_GATEWAY_SECRET;
const ENFORCE_GATEWAY_VALIDATION = process.env.ENFORCE_GATEWAY_VALIDATION === 'true';

// Anonymous user constant
const ANONYMOUS_USER: RequestUser = {
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
 * Validates the structure of the parsed user object from gateway.
 */
const isValidUserObject = (user: any): user is GatewayUser => {
    return (
        typeof user === 'object' &&
        user !== null &&
        typeof user.uuid === 'string' &&
        user.uuid.length > 0 &&
        typeof user.anonymous === 'boolean' &&
        Array.isArray(user.roles)
    );
};

/**
 * JIT (Just-In-Time) provisioning: Sync user from Keycloak to local database
 */
const syncUserToDatabase = async (gatewayUser: GatewayUser): Promise<string | undefined> => {
    // Skip for anonymous users
    if (gatewayUser.anonymous) {
        return undefined;
    }

    // Skip if no email (can't create user without email)
    if (!gatewayUser.email) {
        logger.warn(`[JIT] User ${gatewayUser.uuid} has no email, skipping sync`);
        return undefined;
    }

    try {
        const keycloakInfo: KeycloakUserInfo = {
            uuid: gatewayUser.uuid,
            username: gatewayUser.username,
            email: gatewayUser.email,
            name: gatewayUser.last_name
                ? `${gatewayUser.username} ${gatewayUser.last_name}`
                : gatewayUser.username
        };

        const dbUser = await userService.findOrCreateFromKeycloak(keycloakInfo);
        return dbUser.id;
    } catch (error) {
        logger.error(`[JIT] Failed to sync user ${gatewayUser.uuid}: ${error}`);
        return undefined;
    }
};

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    const headerValue = req.header('X-USER');
    console.log(`[AUTH MIDDLEWARE] Path: ${req.path}, X-USER header present: ${!!headerValue}`);

    // Validate gateway origin when X-USER header is present
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

        const gatewayUser: GatewayUser = JSON.parse(headerValue);

        // Validate user object structure
        if (!isValidUserObject(gatewayUser)) {
            throw new Error('Invalid user object structure');
        }

        // JIT provisioning: sync user to database
        const dbUserId = await syncUserToDatabase(gatewayUser);

        // Build request user object
        const requestUser: RequestUser = {
            uuid: gatewayUser.uuid,
            username: gatewayUser.username,
            email: gatewayUser.email,
            anonymous: gatewayUser.anonymous,
            roles: gatewayUser.roles,
            dbUserId: dbUserId
        };

        (req as any).user = requestUser;
        console.log(`[AUTH MIDDLEWARE] User authenticated: ${gatewayUser.uuid}${dbUserId ? ` (db: ${dbUserId})` : ''}`);
        next();
    } catch (error) {
        console.log(`[AUTH MIDDLEWARE] Using anonymous user: ${error}`);
        (req as any).user = { ...ANONYMOUS_USER };
        next();
    }
};

export default authMiddleware;