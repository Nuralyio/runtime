import { Body, Controller, Delete, Get, Path, Post, Route, Tags, Request } from "tsoa";
import { injectable } from "tsyringe";
import { PendingInvite } from "../models/pending-invite";
import { PendingInviteService } from "../services/pending-invite.service";
import { ApplicationMemberService } from "../../application-member/services/application-member.service";
import { AuthorizationService } from "../../auth/services/authorization.service";
import { NRequest } from "../../shared/interfaces/NRequest.interface";
import { CreatePendingInviteDto, PendingInviteResponse } from "../interfaces/pending-invite.interface";

function toResponse(invite: PendingInvite): PendingInviteResponse {
  return {
    id: invite.id!,
    email: invite.email,
    applicationId: invite.applicationId,
    role: {
      id: invite.role?.id || invite.roleId,
      name: invite.role?.name || '',
      displayName: invite.role?.displayName || '',
      hierarchy: invite.role?.hierarchy || 0,
    },
    invitedBy: invite.invitedBy,
    expiresAt: invite.expiresAt,
    createdAt: invite.createdAt!,
  };
}

@Route('/api/applications/{applicationId}/pending-invites')
@Tags('Pending Invites')
@injectable()
export class PendingInviteController extends Controller {
  constructor(
    private readonly pendingInviteService: PendingInviteService,
    private readonly memberService: ApplicationMemberService,
    private readonly authorizationService: AuthorizationService
  ) {
    super();
  }

  /**
   * List all pending invites for an application
   */
  @Get()
  public async getPendingInvites(
    @Request() request: NRequest,
    @Path() applicationId: string
  ): Promise<PendingInviteResponse[]> {
    // Check if user has permission to view members
    await this.authorizationService.requireAppPermission(
      request.user,
      applicationId,
      'member:read'
    );

    const invites = await this.pendingInviteService.getPendingInvites(applicationId);
    return invites.map(toResponse);
  }

  /**
   * Create a pending invite for a user who doesn't exist yet
   */
  @Post()
  public async createPendingInvite(
    @Request() request: NRequest,
    @Path() applicationId: string,
    @Body() body: CreatePendingInviteDto
  ): Promise<PendingInviteResponse> {
    // Get the inviter's membership
    const inviter = await this.memberService.getMember(request.user.uuid, applicationId);
    if (!inviter) {
      this.setStatus(403);
      throw new Error('You are not a member of this application');
    }

    const invite = await this.pendingInviteService.createPendingInvite(applicationId, body, inviter);
    return toResponse(invite);
  }

  /**
   * Cancel a pending invite
   */
  @Delete('{inviteId}')
  public async cancelPendingInvite(
    @Request() request: NRequest,
    @Path() applicationId: string,
    @Path() inviteId: number
  ): Promise<{ success: boolean; message: string }> {
    // Get the canceller's membership
    const canceller = await this.memberService.getMember(request.user.uuid, applicationId);
    if (!canceller) {
      this.setStatus(403);
      throw new Error('You are not a member of this application');
    }

    await this.pendingInviteService.cancelPendingInvite(applicationId, inviteId, canceller);
    return { success: true, message: 'Invite cancelled successfully' };
  }
}
