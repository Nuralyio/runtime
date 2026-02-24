export class ApplicationVersionModel {
  id?: string;
  applicationId: string;
  version: number;
  name: string;
  subdomain?: string | null;
  defaultPageId?: string | null;
  createdBy: string;
  createdAt?: Date;

  constructor(
    applicationId: string,
    version: number,
    name: string,
    createdBy: string,
    subdomain?: string | null,
    defaultPageId?: string | null
  ) {
    this.applicationId = applicationId;
    this.version = version;
    this.name = name;
    this.createdBy = createdBy;
    this.subdomain = subdomain;
    this.defaultPageId = defaultPageId;
  }
}
