import prisma from '../../../prisma/prisma';
import { IPermissionRepository } from '../interfaces/permission.interface';
import { Permission } from '../models/permission';
import { singleton } from 'tsyringe';
import {NotFoundException} from "../../exceptions/NotFoundException";

@singleton()
export class PermissionRepository implements IPermissionRepository {
    public async create(permission: Permission): Promise<Permission> {
        return await prisma.permission.create({
            data: {
                userId: permission.userId,
                resourceId: permission.resourceId,
                resourceType: permission.resourceType,
                publicState: permission.publicState,
                permissionType: permission.permissionType,
                ownerId: permission.ownerId,
                allowed: permission.allowed,
            }
        })
    }
    public async findPermissionByType(permissionType: string): Promise<Permission[]> {
        const permissions = await prisma.permission.findMany(
            { where: { permissionType } }
        );
        return permissions.map((permission: any) => new Permission(
            permission.userId,
            permission.resourceId,
            permission.resourceType,
            permission.publicState,
            permission.permissionType,
            permission.ownerId,
            permission.allowed));
    }
    public async update(id: number, permission: Permission): Promise<Permission> {
        const { userId, resourceId, resourceType, publicState, permissionType, ownerId, allowed } = permission;

        const updatedPermission = await prisma.permission.update({
            where: { id },
            data: {
                userId,
                resourceId,
                resourceType,
                publicState,
                permissionType,
                ownerId,
                allowed,
            }
        });
        return new Permission(
            updatedPermission.userId,
            updatedPermission.resourceId,
            updatedPermission.resourceType,
            updatedPermission.publicState,
            updatedPermission.permissionType,
            updatedPermission.ownerId,
            updatedPermission.allowed
        );
    }
    public async findPermissionByResourceId(resourceId: string): Promise<Permission> {
        const permission = await prisma.permission.findFirst(
            { where: { resourceId } }
        );
        if(!permission)  throw new NotFoundException('No permission found');
        return  new Permission(
            permission.userId,
            permission.resourceId,
            permission.resourceType,
            permission.publicState,
            permission.permissionType,
            permission.ownerId,
            permission.allowed
        ) ;
    }
    public async delete(id: number): Promise<Permission> {
        const deletePermission = await prisma.permission.delete({
            where: { id }
        });
        const { userId, resourceId, resourceType, publicState, permissionType, ownerId, allowed } = deletePermission;
        return new Permission(
            userId,
            resourceId,
            resourceType,
            publicState,
            permissionType,
            ownerId,
            allowed
        );
    }
}