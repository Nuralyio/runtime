import { Request } from 'express';
export interface NRequest extends Request {
    user?: any; 
  }