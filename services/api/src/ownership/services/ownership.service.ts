import { singleton } from 'tsyringe';
import { Ownership } from '../models/ownership';
import { OwnershipRepository } from '../repositories/ownership.repository';
import { NUser } from '../../auth/domain/user';
import { ResourcePermissionRequest } from '../interfaces/resource-permission.request';
@singleton()
export class OwnershipService {
  private ownershipRepository: OwnershipRepository;

  constructor(ownershipRepository: OwnershipRepository) {
    this.ownershipRepository = ownershipRepository;
  }

  public async getResourceIDWithPermissionOrOwner(resourcePermissionRequest: ResourcePermissionRequest): Promise<string[]> {
    return await this.ownershipRepository.getResourceIDWithPermissionOrOwner(resourcePermissionRequest);
  }


  public async create(resourceType: string, resourceId: string, ownerId: string): Promise<Ownership> {
    const ownership = new Ownership(resourceType, resourceId, ownerId);
    return await this.ownershipRepository.create(ownership);
  }

  public async delete(id: number): Promise<Ownership> {
    return await this.ownershipRepository.delete(id);
  }

  public async getOwnershipByResource(resourceId: string, resourceType: string): Promise<Ownership> {
    return await this.ownershipRepository.getOwnershipByResource(resourceId, resourceType);
  }

  public async getOwnershipByUser(user_uuid: string, resourceId: string, resourceType: string): Promise<Ownership> {
    return await this.ownershipRepository.getOwnershipByUser(user_uuid, resourceId, resourceType);
  }
}