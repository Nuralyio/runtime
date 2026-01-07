import { PendingInvite } from '../models/pending-invite';

export interface IPendingInviteRepository {
  findById(id: number): Promise<PendingInvite | null>;
  findByEmail(email: string): Promise<PendingInvite[]>;
  findByApplicationId(applicationId: string): Promise<PendingInvite[]>;
  findByToken(token: string): Promise<PendingInvite | null>;
  findByEmailAndApplication(email: string, applicationId: string): Promise<PendingInvite | null>;
  create(invite: PendingInvite): Promise<PendingInvite>;
  delete(id: number): Promise<PendingInvite>;
  deleteByEmailAndApplication(email: string, applicationId: string): Promise<void>;
  deleteExpired(): Promise<number>;
}

export interface CreatePendingInviteDto {
  email: string;
  roleId: number;
}

export interface PendingInviteResponse {
  id: number;
  email: string;
  applicationId: string;
  role: {
    id: number;
    name: string;
    displayName: string;
    hierarchy: number;
  };
  invitedBy: string;
  expiresAt: Date;
  createdAt: Date;
}
