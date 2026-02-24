export class PageVersionModel {
  id?: string;
  pageId: string;
  applicationId: string;
  version: number;
  name: string;
  url: string;
  description: string;
  style: any;
  needAuth: boolean;
  componentIds: string[];
  createdBy: string;
  createdAt?: Date;

  constructor(
    pageId: string,
    applicationId: string,
    version: number,
    name: string,
    url: string,
    description: string,
    style: any,
    needAuth: boolean,
    componentIds: string[],
    createdBy: string
  ) {
    this.pageId = pageId;
    this.applicationId = applicationId;
    this.version = version;
    this.name = name;
    this.url = url;
    this.description = description;
    this.style = style;
    this.needAuth = needAuth;
    this.componentIds = componentIds;
    this.createdBy = createdBy;
  }
}
