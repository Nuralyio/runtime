export class ComponentVersionModel {
  id?: string;
  componentId: string;
  applicationId: string;
  version: number;
  componentData: any;
  createdBy: string;
  createdAt?: Date;

  constructor(
    componentId: string,
    applicationId: string,
    version: number,
    componentData: any,
    createdBy: string
  ) {
    this.componentId = componentId;
    this.applicationId = applicationId;
    this.version = version;
    this.componentData = componentData;
    this.createdBy = createdBy;
  }
}
