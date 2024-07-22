import { Permission } from "../models/permission";

export interface IPermissionRepository {
    create(permission: Permission): Promise<Permission>;
    findPermissionByType(permissionType: string): Promise<Permission[]>;
    update(id: number, Permission: Permission): Promise<Permission>;
    delete(id: number): Promise<Permission>;

}