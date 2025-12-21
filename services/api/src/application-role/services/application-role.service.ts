import { singleton } from 'tsyringe';
import { ApplicationRole } from '../models/application-role';
import { ApplicationRoleRepository } from '../repositories/application-role.repository';
import { CreateRoleDto, UpdateRoleDto } from '../interfaces/application-role.interface';

@singleton()
export class ApplicationRoleService {
  constructor(private readonly repository: ApplicationRoleRepository) {}

  /**
   * Get all system roles (owner, admin, editor, viewer)
   */
  async getSystemRoles(): Promise<ApplicationRole[]> {
    return this.repository.findSystemRoles();
  }

  /**
   * Get all roles available for an application (system + custom)
   */
  async getRolesForApplication(applicationId: string): Promise<ApplicationRole[]> {
    return this.repository.findByApplicationId(applicationId);
  }

  /**
   * Get a specific role by ID
   */
  async getRoleById(id: number): Promise<ApplicationRole | null> {
    return this.repository.findById(id);
  }

  /**
   * Get system role by name (e.g., 'owner', 'admin')
   */
  async getSystemRoleByName(name: string): Promise<ApplicationRole | null> {
    return this.repository.findByName(null, name);
  }

  /**
   * Create a custom role for an application
   */
  async createCustomRole(applicationId: string, dto: CreateRoleDto): Promise<ApplicationRole> {
    // Validate hierarchy (custom roles cannot have hierarchy >= 100)
    if (dto.hierarchy >= 100) {
      throw new Error('Custom role hierarchy must be less than 100 (reserved for owner)');
    }

    // Check if role name already exists for this application
    const existingRole = await this.repository.findByName(applicationId, dto.name);
    if (existingRole) {
      throw new Error(`Role "${dto.name}" already exists for this application`);
    }

    const role = new ApplicationRole(
      dto.name,
      dto.displayName,
      dto.permissions,
      dto.hierarchy,
      applicationId,
      dto.description || null,
      false // isSystem = false for custom roles
    );

    return this.repository.create(role);
  }

  /**
   * Update a custom role
   */
  async updateRole(id: number, dto: UpdateRoleDto): Promise<ApplicationRole> {
    const role = await this.repository.findById(id);
    if (!role) {
      throw new Error('Role not found');
    }

    if (role.isSystem) {
      throw new Error('Cannot modify system roles');
    }

    if (dto.hierarchy !== undefined && dto.hierarchy >= 100) {
      throw new Error('Custom role hierarchy must be less than 100');
    }

    return this.repository.update(id, dto);
  }

  /**
   * Delete a custom role
   */
  async deleteRole(id: number): Promise<ApplicationRole> {
    const role = await this.repository.findById(id);
    if (!role) {
      throw new Error('Role not found');
    }

    if (role.isSystem) {
      throw new Error('Cannot delete system roles');
    }

    return this.repository.delete(id);
  }
}
