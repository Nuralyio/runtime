import { singleton } from 'tsyringe';
import { Ownership } from '../models/ownership';
import { OwnershipRepository } from '../repositories/ownership.repository';
import { NUser } from '../../auth/domain/user';
import { ResourcePermissionRequest } from '../interfaces/resource-permission.request';
@singleton()
export class OwnershipService {
  private applicationRepository: OwnershipRepository;

  constructor(productRepository: OwnershipRepository) {
    this.applicationRepository = productRepository;
  }

  public async getResourceIDWithPermissionOrOwner(resourcePermissionRequest : ResourcePermissionRequest): Promise<string[]> {
    return await this.applicationRepository.getResourceIDWithPermissionOrOwner(resourcePermissionRequest);
  }
}