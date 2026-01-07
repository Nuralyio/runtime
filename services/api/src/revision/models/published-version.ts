export class PublishedVersionModel {
  id?: string;
  applicationId: string;
  revision: number;
  publishedBy: string;
  publishedAt?: Date;

  constructor(
    applicationId: string,
    revision: number,
    publishedBy: string
  ) {
    this.applicationId = applicationId;
    this.revision = revision;
    this.publishedBy = publishedBy;
  }
}
