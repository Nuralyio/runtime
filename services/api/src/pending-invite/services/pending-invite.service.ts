import { singleton } from 'tsyringe';
import { PendingInvite } from '../models/pending-invite';
import { PendingInviteRepository } from '../repositories/pending-invite.repository';
import { ApplicationRoleService } from '../../application-role/services/application-role.service';
import { ApplicationMemberService } from '../../application-member/services/application-member.service';
import { ApplicationMember } from '../../application-member/models/application-member';
import { CreatePendingInviteDto } from '../interfaces/pending-invite.interface';

// Default invite expiration: 7 days
const DEFAULT_EXPIRATION_DAYS = 7;

@singleton()
export class PendingInviteService {
  constructor(
    private readonly repository: PendingInviteRepository,
    private readonly roleService: ApplicationRoleService
  ) {}

  /**
   * Get all pending invites for an application
   */
  async getPendingInvites(applicationId: string): Promise<PendingInvite[]> {
    return this.repository.findByApplicationId(applicationId);
  }

  /**
   * Get a pending invite by ID
   */
  async getPendingInviteById(id: number): Promise<PendingInvite | null> {
    return this.repository.findById(id);
  }

  /**
   * Get pending invites for a specific email
   */
  async getPendingInvitesForEmail(email: string): Promise<PendingInvite[]> {
    return this.repository.findByEmail(email);
  }

  /**
   * Create a pending invite for a user who doesn't exist yet
   */
  async createPendingInvite(
    applicationId: string,
    dto: CreatePendingInviteDto,
    invitedBy: ApplicationMember
  ): Promise<PendingInvite> {
    // Check if inviter has permission
    if (!invitedBy.hasPermission('member:invite')) {
      throw new Error('You do not have permission to invite members');
    }

    // Get the target role
    const targetRole = await this.roleService.getRoleById(dto.roleId);
    if (!targetRole) {
      throw new Error('Role not found');
    }

    // Check hierarchy - cannot assign role with hierarchy >= your own
    if (!invitedBy.role || targetRole.hierarchy >= invitedBy.getHierarchy()) {
      throw new Error('Cannot assign a role with equal or higher hierarchy than your own');
    }

    // Check if pending invite already exists for this email + application
    const existingInvite = await this.repository.findByEmailAndApplication(dto.email, applicationId);
    if (existingInvite) {
      throw new Error('An invite is already pending for this email');
    }

    // Calculate expiration date
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + DEFAULT_EXPIRATION_DAYS);

    const invite = new PendingInvite(
      dto.email.toLowerCase(),
      applicationId,
      dto.roleId,
      invitedBy.userId,
      expiresAt
    );

    return this.repository.create(invite);
  }

  /**
   * Cancel a pending invite
   */
  async cancelPendingInvite(
    applicationId: string,
    inviteId: number,
    cancelledBy: ApplicationMember
  ): Promise<PendingInvite> {
    // Check if canceller has permission
    if (!cancelledBy.hasPermission('member:remove')) {
      throw new Error('You do not have permission to cancel invites');
    }

    // Get the invite
    const invite = await this.repository.findById(inviteId);
    if (!invite) {
      throw new Error('Invite not found');
    }

    // Verify invite belongs to this application
    if (invite.applicationId !== applicationId) {
      throw new Error('Invite not found');
    }

    // Check hierarchy - cannot cancel invite for role >= your own
    const targetRole = await this.roleService.getRoleById(invite.roleId);
    if (targetRole && targetRole.hierarchy >= cancelledBy.getHierarchy()) {
      throw new Error('Cannot cancel an invite for a role with equal or higher hierarchy than your own');
    }

    return this.repository.delete(inviteId);
  }

  /**
   * Accept all pending invites for a user (called when user signs up/logs in)
   * Returns the list of application IDs the user was added to
   */
  async acceptPendingInvitesForUser(
    userId: string,
    email: string,
    memberService: ApplicationMemberService
  ): Promise<string[]> {
    const pendingInvites = await this.repository.findByEmail(email);
    const acceptedApplicationIds: string[] = [];

    for (const invite of pendingInvites) {
      if (invite.isExpired()) {
        // Clean up expired invite
        await this.repository.delete(invite.id!);
        continue;
      }

      try {
        // Create the membership directly (bypassing permission checks since this is system action)
        const member = new ApplicationMember(userId, invite.applicationId, invite.roleId);
        await this.createMemberDirectly(member, memberService);

        // Delete the pending invite
        await this.repository.delete(invite.id!);

        acceptedApplicationIds.push(invite.applicationId);
      } catch (error) {
        // If membership creation fails (e.g., user already member), just delete the invite
        await this.repository.delete(invite.id!);
      }
    }

    return acceptedApplicationIds;
  }

  /**
   * Helper to create member directly (for auto-accept flow)
   */
  private async createMemberDirectly(
    member: ApplicationMember,
    memberService: ApplicationMemberService
  ): Promise<ApplicationMember> {
    // This accesses the internal repository - we need to expose a method for this
    // For now, we'll use a workaround via the public API
    return memberService['repository'].create(member);
  }

  /**
   * Clean up expired invites
   */
  async cleanupExpired(): Promise<number> {
    return this.repository.deleteExpired();
  }
}
