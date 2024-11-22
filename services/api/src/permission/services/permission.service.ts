import { singleton } from "tsyringe";
import { PermissionRepository } from '../repositories/permission.repository';
import { Permission } from "../models/permission";

@singleton()
export class PermissionService {

  private PermissionRepository: PermissionRepository;

  constructor(permissionRepository: PermissionRepository) {
    this.PermissionRepository = permissionRepository;
  }
  public async create(userId: string,
    resourceId: string,
    resourceType: string,
    publicState: boolean,
    permissionType: string,
    ownerId: string,
    allowed: any): Promise<Permission> {
    const permission: Permission = new Permission(
      userId,
      resourceId,
      resourceType,
      publicState,
      permissionType,
      ownerId,
      allowed);
    return await this.PermissionRepository.create(permission)
  }

  public async findPermissionByType(permissionType: string): Promise<Permission[]> {
    return await this.PermissionRepository.findPermissionByType(permissionType);
  }

  public async findPermissionByResourceId(resourceId: string): Promise<Permission> {
    return await this.PermissionRepository.findPermissionByResourceId(resourceId);
  }

  public async update(id: number, userId: string,
    resourceId: string,
    resourceType: string,
    publicState: boolean,
    permissionType: string,
    ownerId: string,
    allowed: any): Promise<Permission> {
    const permission: Permission = new Permission(
      userId,
      resourceId,
      resourceType,
      publicState,
      permissionType,
      ownerId,
      allowed
    );
    return await this.PermissionRepository.update(id, permission);
  }

  public async delete(id: number): Promise<Permission> {
    return await this.PermissionRepository.delete(id);
  }
}