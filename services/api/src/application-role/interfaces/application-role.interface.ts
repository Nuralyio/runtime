import { ApplicationRole } from '../models/application-role';

export interface IApplicationRoleRepository {
  findById(id: number): Promise<ApplicationRole | null>;
  findByName(applicationId: string | null, name: string): Promise<ApplicationRole | null>;
  findSystemRoles(): Promise<ApplicationRole[]>;
  findByApplicationId(applicationId: string): Promise<ApplicationRole[]>;
  create(role: ApplicationRole): Promise<ApplicationRole>;
  update(id: number, role: Partial<ApplicationRole>): Promise<ApplicationRole>;
  delete(id: number): Promise<ApplicationRole>;
}

export interface CreateRoleDto {
  name: string;
  displayName: string;
  description?: string;
  permissions: string[];
  hierarchy: number;
}

export interface UpdateRoleDto {
  displayName?: string;
  description?: string;
  permissions?: string[];
  hierarchy?: number;
}
