export interface TemplateSnapshot {
  pages: TemplatePageSnapshot[];
  components: TemplateComponentSnapshot[];
  workflows: TemplateWorkflowSnapshot[];
  functions: TemplateFunctionSnapshot[];
}

export interface TemplatePageSnapshot {
  originalUuid: string;
  name: string;
  url: string;
  description: string;
  style: any;
  event: any;
  need_authentication: boolean;
  component_ids: string[];
}

export interface TemplateComponentSnapshot {
  originalUuid: string;
  component: any;
}

export interface TemplateWorkflowSnapshot {
  id: string;
  name: string;
  description: string;
  variables: string;
  nodes: any[];
  edges: any[];
}

export interface TemplateFunctionSnapshot {
  id: string;
  label: string;
  description: string;
  template: string;
  runtime: string;
  handler: string;
}

export class AppTemplate {
  id?: string;
  name: string;
  description: string;
  category: string;
  thumbnail?: string | null;
  public: boolean;
  verified: boolean;
  sourceAppId: string;
  createdBy: string;
  snapshot: TemplateSnapshot;
  createdAt?: Date;
  updatedAt?: Date;

  constructor(
    name: string,
    description: string,
    category: string,
    sourceAppId: string,
    createdBy: string,
    snapshot: TemplateSnapshot,
    isPublic: boolean = false,
    verified: boolean = false,
    thumbnail?: string | null,
    id?: string,
    createdAt?: Date,
    updatedAt?: Date
  ) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.category = category;
    this.sourceAppId = sourceAppId;
    this.createdBy = createdBy;
    this.snapshot = snapshot;
    this.public = isPublic;
    this.verified = verified;
    this.thumbnail = thumbnail;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }
}
