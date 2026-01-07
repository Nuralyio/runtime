import { singleton } from 'tsyringe';
import prisma from '../../../prisma/prisma';
import { PendingInvite } from '../models/pending-invite';
import { IPendingInviteRepository } from '../interfaces/pending-invite.interface';
import { ApplicationRole } from '../../application-role/models/application-role';

@singleton()
export class PendingInviteRepository implements IPendingInviteRepository {

  private mapRoleToModel(data: any): ApplicationRole {
    const role = new ApplicationRole(
      data.name,
      data.displayName,
      data.permissions as string[],
      data.hierarchy,
      data.applicationId,
      data.description,
      data.isSystem
    );
    role.id = data.id;
    role.createdAt = data.createdAt;
    return role;
  }

  private mapToModel(data: any): PendingInvite {
    const invite = new PendingInvite(
      data.email,
      data.applicationId,
      data.roleId,
      data.invitedBy,
      data.expiresAt,
      data.token
    );
    invite.id = data.id;
    invite.createdAt = data.createdAt;
    if (data.role) {
      invite.role = this.mapRoleToModel(data.role);
    }
    return invite;
  }

  async findById(id: number): Promise<PendingInvite | null> {
    const data = await prisma.pendingInvite.findUnique({
      where: { id },
      include: { role: true },
    });
    return data ? this.mapToModel(data) : null;
  }

  async findByEmail(email: string): Promise<PendingInvite[]> {
    const data = await prisma.pendingInvite.findMany({
      where: {
        email: email.toLowerCase(),
        expiresAt: { gt: new Date() },
      },
      include: { role: true },
    });
    return data.map((d: any) => this.mapToModel(d));
  }

  async findByApplicationId(applicationId: string): Promise<PendingInvite[]> {
    const data = await prisma.pendingInvite.findMany({
      where: {
        applicationId,
        expiresAt: { gt: new Date() },
      },
      include: { role: true },
      orderBy: { createdAt: 'desc' },
    });
    return data.map((d: any) => this.mapToModel(d));
  }

  async findByToken(token: string): Promise<PendingInvite | null> {
    const data = await prisma.pendingInvite.findUnique({
      where: { token },
      include: { role: true },
    });
    return data ? this.mapToModel(data) : null;
  }

  async findByEmailAndApplication(email: string, applicationId: string): Promise<PendingInvite | null> {
    const data = await prisma.pendingInvite.findFirst({
      where: {
        email: email.toLowerCase(),
        applicationId,
        expiresAt: { gt: new Date() },
      },
      include: { role: true },
    });
    return data ? this.mapToModel(data) : null;
  }

  async create(invite: PendingInvite): Promise<PendingInvite> {
    const data = await prisma.pendingInvite.create({
      data: {
        email: invite.email.toLowerCase(),
        applicationId: invite.applicationId,
        roleId: invite.roleId,
        invitedBy: invite.invitedBy,
        expiresAt: invite.expiresAt,
      },
      include: { role: true },
    });
    return this.mapToModel(data);
  }

  async delete(id: number): Promise<PendingInvite> {
    const data = await prisma.pendingInvite.delete({
      where: { id },
      include: { role: true },
    });
    return this.mapToModel(data);
  }

  async deleteByEmailAndApplication(email: string, applicationId: string): Promise<void> {
    await prisma.pendingInvite.deleteMany({
      where: {
        email: email.toLowerCase(),
        applicationId,
      },
    });
  }

  async deleteExpired(): Promise<number> {
    const result = await prisma.pendingInvite.deleteMany({
      where: {
        expiresAt: { lt: new Date() },
      },
    });
    return result.count;
  }
}
