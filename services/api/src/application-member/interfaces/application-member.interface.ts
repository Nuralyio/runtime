import { ApplicationMember } from '../models/application-member';

export interface IApplicationMemberRepository {
  findById(id: number): Promise<ApplicationMember | null>;
  findByUserAndApplication(userId: string, applicationId: string): Promise<ApplicationMember | null>;
  findByApplicationId(applicationId: string): Promise<ApplicationMember[]>;
  findApplicationsForUser(userId: string): Promise<string[]>;
  create(member: ApplicationMember): Promise<ApplicationMember>;
  update(id: number, roleId: number): Promise<ApplicationMember>;
  delete(id: number): Promise<ApplicationMember>;
  deleteByUserAndApplication(userId: string, applicationId: string): Promise<ApplicationMember>;
}

export interface InviteMemberDto {
  userId: string;
  roleId: number;
}

export interface UpdateMemberRoleDto {
  roleId: number;
}
