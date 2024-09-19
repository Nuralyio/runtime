import { singleton } from 'tsyringe';
import prisma from '../../../prisma/prisma'
import { Ownership } from '../models/ownership';
import { IOwnershipRepository } from '../interfaces/ownership.interface';
import { ResourcePermissionRequest } from '../interfaces/resource-permission.request';

@singleton()
export class OwnershipRepository implements IOwnershipRepository {

  public async getOwnershipByResource(resourceId: string, resourceType: string): Promise<Ownership> {
    const ownership = await prisma.ownership.findFirst({
      where: { resourceId, resourceType }
    });
    return new Ownership(ownership!.resourceType, ownership!.resourceId, ownership!.ownerId);
  }

  public async getOwnershipByUser(user_uuid: string, resourceId: string, resourceType: string): Promise<Ownership> {
    const ownership = await prisma.ownership.findFirst({
      where: { /*user_uuid,*/ resourceId, resourceType }
    });
    return new Ownership(ownership!.resourceType, ownership!.resourceId, ownership!.ownerId);
  }

  public async create(ownership: Ownership): Promise<Ownership> {
    return await prisma.ownership.create({
      data: {
        resourceType: ownership.resourceType,
        resourceId: ownership.resourceId,
        ownerId: ownership.ownerId
      }
    })
  }

  public async getResourceIDWithPermissionOrOwner(resourcePermissionRequest: ResourcePermissionRequest): Promise<string[]> {
    const { user = { uuid : "0000", roles: []}, resourceType, permissionType } = resourcePermissionRequest;

    const resources = await prisma.$queryRaw`
        SELECT resource_id
        FROM "ownership"
        WHERE resource_type = ${resourceType}
            AND owner_id = ${user.uuid}
        UNION
        SELECT resource_id
        FROM "permissions"
        WHERE resource_type = ${resourceType}
            AND (
                permission_type = ${permissionType}
                OR (permission_type = ${permissionType} AND permissions.allowed -> 'roles' ?| array(SELECT unnest(${user.roles.map(role => role.name)}::text[])))
            )
    `;
    return (resources as any).map((resource: { resource_id: string }) => resource.resource_id);

  }
  public async delete(id: number): Promise<Ownership> {
    const deleteOwnership = await prisma.ownership.delete({
      where: { id }
    });
    return new Ownership(deleteOwnership.resourceType, deleteOwnership.resourceId, deleteOwnership.ownerId);
  }

}