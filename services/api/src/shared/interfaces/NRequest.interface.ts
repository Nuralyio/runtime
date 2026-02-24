import { Request } from 'express';
import { NUser } from '../../auth/domain/user';
export interface NRequest extends Request {
    user: NUser; 
  }