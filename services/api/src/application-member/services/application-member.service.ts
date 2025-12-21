import { singleton } from 'tsyringe';
import { ApplicationMember } from '../models/application-member';
import { ApplicationMemberRepository } from '../repositories/application-member.repository';
import { ApplicationRoleService } from '../../application-role/services/application-role.service';
import { InviteMemberDto, UpdateMemberRoleDto } from '../interfaces/application-member.interface';

@singleton()
export class ApplicationMemberService {
  constructor(
    private readonly repository: ApplicationMemberRepository,
    private readonly roleService: ApplicationRoleService
  ) {}

  /**
   * Get member details for a user in an application
   */
  async getMember(userId: string, applicationId: string): Promise<ApplicationMember | null> {
    return this.repository.findByUserAndApplication(userId, applicationId);
  }

  /**
   * Get all members of an application
   */
  async getApplicationMembers(applicationId: string): Promise<ApplicationMember[]> {
    return this.repository.findByApplicationId(applicationId);
  }

  /**
   * Get all applications a user is a member of
   */
  async getUserApplications(userId: string): Promise<string[]> {
    return this.repository.findApplicationsForUser(userId);
  }

  /**
   * Get applications where user has a specific permission
   */
  async getApplicationsWithPermission(userId: string, permission: string): Promise<string[]> {
    return this.repository.findApplicationsWithPermission(userId, permission);
  }

  /**
   * Create application membership with owner role (used when creating new application)
   */
  async createOwnerMembership(userId: string, applicationId: string): Promise<ApplicationMember> {
    const ownerRole = await this.roleService.getSystemRoleByName('owner');
    if (!ownerRole || !ownerRole.id) {
      throw new Error('Owner role not found. Please run database seed.');
    }

    const member = new ApplicationMember(userId, applicationId, ownerRole.id);
    return this.repository.create(member);
  }

  /**
   * Invite a user to an application with a specific role
   */
  async inviteMember(
    applicationId: string,
    dto: InviteMemberDto,
    invitedBy: ApplicationMember
  ): Promise<ApplicationMember> {
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

    // Check if user is already a member
    const existingMember = await this.repository.findByUserAndApplication(dto.userId, applicationId);
    if (existingMember) {
      throw new Error('User is already a member of this application');
    }

    const member = new ApplicationMember(dto.userId, applicationId, dto.roleId);
    return this.repository.create(member);
  }

  /**
   * Update a member's role
   */
  async updateMemberRole(
    applicationId: string,
    targetUserId: string,
    dto: UpdateMemberRoleDto,
    updatedBy: ApplicationMember
  ): Promise<ApplicationMember> {
    // Check if updater has permission
    if (!updatedBy.hasPermission('member:update')) {
      throw new Error('You do not have permission to update members');
    }

    // Get target member
    const targetMember = await this.repository.findByUserAndApplication(targetUserId, applicationId);
    if (!targetMember || !targetMember.id) {
      throw new Error('Member not found');
    }

    // Cannot modify users with hierarchy >= your own
    if (targetMember.getHierarchy() >= updatedBy.getHierarchy()) {
      throw new Error('Cannot modify a member with equal or higher hierarchy than your own');
    }

    // Get the new role
    const newRole = await this.roleService.getRoleById(dto.roleId);
    if (!newRole) {
      throw new Error('Role not found');
    }

    // Cannot assign role with hierarchy >= your own
    if (newRole.hierarchy >= updatedBy.getHierarchy()) {
      throw new Error('Cannot assign a role with equal or higher hierarchy than your own');
    }

    return this.repository.update(targetMember.id, dto.roleId);
  }

  /**
   * Remove a member from an application
   */
  async removeMember(
    applicationId: string,
    targetUserId: string,
    removedBy: ApplicationMember
  ): Promise<ApplicationMember> {
    // Check if remover has permission
    if (!removedBy.hasPermission('member:remove')) {
      throw new Error('You do not have permission to remove members');
    }

    // Get target member
    const targetMember = await this.repository.findByUserAndApplication(targetUserId, applicationId);
    if (!targetMember || !targetMember.id) {
      throw new Error('Member not found');
    }

    // Cannot remove users with hierarchy >= your own
    if (targetMember.getHierarchy() >= removedBy.getHierarchy()) {
      throw new Error('Cannot remove a member with equal or higher hierarchy than your own');
    }

    // Cannot remove the last owner
    if (targetMember.isOwner()) {
      const ownerCount = await this.repository.countOwners(applicationId);
      if (ownerCount <= 1) {
        throw new Error('Cannot remove the last owner. Transfer ownership first.');
      }
    }

    return this.repository.delete(targetMember.id);
  }

  /**
   * Check if a user has a specific permission in an application
   */
  async hasPermission(userId: string, applicationId: string, permission: string): Promise<boolean> {
    const member = await this.repository.findByUserAndApplication(userId, applicationId);
    if (!member) {
      return false;
    }
    return member.hasPermission(permission);
  }
}
