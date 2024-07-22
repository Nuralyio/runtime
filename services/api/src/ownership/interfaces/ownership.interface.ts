import { Ownership } from "../models/ownership";
import { ResourcePermissionRequest } from "./resource-permission.request";

export interface IOwnershipRepository {
    getResourceIDWithPermissionOrOwner(resourcePermissionRequest: ResourcePermissionRequest): Promise<string[]>;
    create(ownership: Ownership): Promise<Ownership>;
    delete(id: number): Promise<Ownership>;
}