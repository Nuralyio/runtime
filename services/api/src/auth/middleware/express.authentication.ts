import { Request } from 'express';
import jwt from 'jsonwebtoken';

const secretKey = process.env.SECRET_KEY || 'default-secret';

export const expressAuthentication = (request: Request, securityName: string, scopes?: string[]): Promise<any> => {
  if (securityName === 'bearerAuth') {
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      return Promise.reject({
        status: 401,
        message: 'No authorization header provided. Please include a Bearer token in the Authorization header.'
      });
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      return Promise.reject({
        status: 401,
        message: 'No token provided. Ensure your Authorization header includes a Bearer token.'
      });
    }

    return new Promise((resolve, reject) => {
      jwt.verify(token, secretKey, (err, decoded) => {
        if (err) {
          reject({
            status: 403,
            message: 'Invalid or expired token. Please provide a valid token.'
          });
        } else {
          resolve(decoded);
        }
      });
    });
  }

  return Promise.reject({
    status: 400,
    message: 'Invalid security name provided. Only "bearerAuth" is supported.'
  });
};
