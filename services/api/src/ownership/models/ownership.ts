export class Ownership {
   
    resourceType: string
    resourceId: string;
    ownerId: string;
    id!: number;
  
    constructor(resourceType: string, resourceId: string, ownerId: string) {
      this.resourceType = resourceType;
      this.resourceId = resourceId;
      this.ownerId = ownerId;
    }

  }
  