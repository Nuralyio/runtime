import { ResourcePermissionRequest } from "./resource-permission.request";

export interface IOwnershipRepository{
    getResourceIDWithPermissionOrOwner(resourcePermissionRequest : ResourcePermissionRequest): Promise<string[]>;
    
}