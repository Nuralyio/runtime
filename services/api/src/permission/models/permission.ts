export class Permission {

  userId: string;
  resourceId: string;
  resourceType: string;
  publicState: boolean;
  permissionType: string;
  ownerId: string;
  allowed: any;

  constructor(userId: string, resourceId: string, resourceType: string, publicState: boolean, permissionType: string, ownerId: string, allowed: any) {
    this.userId = userId;
    this.resourceId = resourceId;
    this.resourceType = resourceType;
    this.publicState = publicState;
    this.permissionType = permissionType;
    this.ownerId = ownerId;
    this.allowed = allowed;
  }
}