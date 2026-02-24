import { ApplicationRole } from '../../application-role/models/application-role';

export class PendingInvite {
  id?: number;
  email: string;
  applicationId: string;
  roleId: number;
  invitedBy: string;
  token?: string;
  expiresAt: Date;
  createdAt?: Date;
  role?: ApplicationRole;

  constructor(
    email: string,
    applicationId: string,
    roleId: number,
    invitedBy: string,
    expiresAt: Date,
    token?: string
  ) {
    this.email = email;
    this.applicationId = applicationId;
    this.roleId = roleId;
    this.invitedBy = invitedBy;
    this.expiresAt = expiresAt;
    this.token = token;
  }

  /**
   * Check if the invite has expired
   */
  isExpired(): boolean {
    return new Date() > this.expiresAt;
  }

  /**
   * Get remaining time until expiration in days
   */
  getRemainingDays(): number {
    const now = new Date();
    const diff = this.expiresAt.getTime() - now.getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }
}
