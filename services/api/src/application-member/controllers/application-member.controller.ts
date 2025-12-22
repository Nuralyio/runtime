import { Body, Controller, Delete, Get, Path, Post, Put, Route, Tags, Request } from "tsoa";
import { injectable } from "tsyringe";
import { ApplicationMember } from "../models/application-member";
import { ApplicationMemberService } from "../services/application-member.service";
import { AuthorizationService } from "../../auth/services/authorization.service";
import { NRequest } from "../../shared/interfaces/NRequest.interface";
import { InviteMemberDto, UpdateMemberRoleDto } from "../interfaces/application-member.interface";

interface MemberResponse {
  id: number;
  userId: string;
  applicationId: string;
  role: {
    id: number;
    name: string;
    displayName: string;
    hierarchy: number;
  };
  createdAt: Date;
}

function toResponse(member: ApplicationMember): MemberResponse {
  return {
    id: member.id!,
    userId: member.userId,
    applicationId: member.applicationId,
    role: {
      id: member.role?.id!,
      name: member.role?.name || '',
      displayName: member.role?.displayName || '',
      hierarchy: member.role?.hierarchy || 0,
    },
    createdAt: member.createdAt!,
  };
}

@Route('/api/applications/{applicationId}/members')
@Tags('Application Members')
@injectable()
export class ApplicationMemberController extends Controller {
  constructor(
    private readonly memberService: ApplicationMemberService,
    private readonly authorizationService: AuthorizationService
  ) {
    super();
  }

  /**
   * List all members of an application
   */
  @Get()
  public async getMembers(
    @Request() request: NRequest,
    @Path() applicationId: string
  ): Promise<MemberResponse[]> {
    // Check if user has permission to view members
    await this.authorizationService.requireAppPermission(
      request.user,
      applicationId,
      'member:read'
    );

    const members = await this.memberService.getApplicationMembers(applicationId);
    return members.map(toResponse);
  }

  /**
   * Get a specific member's details
   */
  @Get('{userId}')
  public async getMember(
    @Request() request: NRequest,
    @Path() applicationId: string,
    @Path() userId: string
  ): Promise<MemberResponse> {
    // Check if user has permission to view members
    await this.authorizationService.requireAppPermission(
      request.user,
      applicationId,
      'member:read'
    );

    const member = await this.memberService.getMember(userId, applicationId);
    if (!member) {
      this.setStatus(404);
      throw new Error('Member not found');
    }

    return toResponse(member);
  }

  /**
   * Invite a user to an application with a specific role
   */
  @Post()
  public async inviteMember(
    @Request() request: NRequest,
    @Path() applicationId: string,
    @Body() body: InviteMemberDto
  ): Promise<MemberResponse> {
    // Get the inviter's membership
    const inviter = await this.memberService.getMember(request.user.uuid, applicationId);
    if (!inviter) {
      this.setStatus(403);
      throw new Error('You are not a member of this application');
    }

    const member = await this.memberService.inviteMember(applicationId, body, inviter);
    return toResponse(member);
  }

  /**
   * Update a member's role
   */
  @Put('{userId}')
  public async updateMemberRole(
    @Request() request: NRequest,
    @Path() applicationId: string,
    @Path() userId: string,
    @Body() body: UpdateMemberRoleDto
  ): Promise<MemberResponse> {
    // Get the updater's membership
    const updater = await this.memberService.getMember(request.user.uuid, applicationId);
    if (!updater) {
      this.setStatus(403);
      throw new Error('You are not a member of this application');
    }

    const member = await this.memberService.updateMemberRole(applicationId, userId, body, updater);
    return toResponse(member);
  }

  /**
   * Remove a member from an application
   */
  @Delete('{userId}')
  public async removeMember(
    @Request() request: NRequest,
    @Path() applicationId: string,
    @Path() userId: string
  ): Promise<{ success: boolean; message: string }> {
    // Get the remover's membership
    const remover = await this.memberService.getMember(request.user.uuid, applicationId);
    if (!remover) {
      this.setStatus(403);
      throw new Error('You are not a member of this application');
    }

    await this.memberService.removeMember(applicationId, userId, remover);
    return { success: true, message: 'Member removed successfully' };
  }
}
