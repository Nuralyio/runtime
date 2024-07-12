import { NUser } from "../../auth/domain/user";

export interface ResourcePermissionRequest {
    user: NUser;
    resourceType: string;
    permissionType: string
}
