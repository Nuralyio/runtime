export interface PageRef {
  pageId: string;
  version: number;
}

export interface ComponentRef {
  componentId: string;
  version: number;
}

export class ApplicationRevisionModel {
  id?: string;
  applicationId: string;
  revision: number;
  versionLabel?: string | null;
  description?: string | null;
  appVersion: number;
  pageRefs: PageRef[];
  componentRefs: ComponentRef[];
  createdBy: string;
  createdAt?: Date;

  constructor(
    applicationId: string,
    revision: number,
    appVersion: number,
    pageRefs: PageRef[],
    componentRefs: ComponentRef[],
    createdBy: string,
    versionLabel?: string | null,
    description?: string | null
  ) {
    this.applicationId = applicationId;
    this.revision = revision;
    this.appVersion = appVersion;
    this.pageRefs = pageRefs;
    this.componentRefs = componentRefs;
    this.createdBy = createdBy;
    this.versionLabel = versionLabel;
    this.description = description;
  }
}
