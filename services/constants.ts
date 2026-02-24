// Use gateway hostname for SSR context (inside docker), and relative path for client-side
const API_BASE = typeof window === 'undefined'
  ? `http://${process.env.NURALY_SERVICES_HOST || "gateway"}`
  : '';

export const APIS_URL = {
  // Applications
  getApplication: (id: any) => `${API_BASE}/api/applications/${id}`,
  getApplicationComponents: (id: any) => `${API_BASE}/api/components/application/${id}`,
  fetchAllApplications: () => `${API_BASE}/api/applications`,
  getApplicationPages: (uuid: any) => `${API_BASE}/api/pages/application/${uuid}`,
  getPageComponents: (uuid: any) => `${API_BASE}/api/pages/${uuid}/components`,
  getApplicationPermission: (application_id: string, resource_id: string) => `${API_BASE}/api/permissions/${application_id}/${resource_id}`,
  // Revision endpoints
  getRevisions: (applicationUuid: string) => `${API_BASE}/api/applications/${applicationUuid}/revisions`,
  getRevision: (applicationUuid: string, revision: number) => `${API_BASE}/api/applications/${applicationUuid}/revisions/${revision}`,
  getRevisionPreview: (applicationUuid: string, revision: number) => `${API_BASE}/api/applications/${applicationUuid}/revisions/${revision}/preview`,
  getPublishedRevision: (applicationUuid: string) => `${API_BASE}/api/applications/${applicationUuid}/revisions/published`,
  getPublishedSnapshot: (applicationUuid: string) => `${API_BASE}/api/applications/${applicationUuid}/revisions/published/snapshot`,
  createRevision: (applicationUuid: string) => `${API_BASE}/api/applications/${applicationUuid}/revisions`,
  publishRevision: (applicationUuid: string, revision: number) => `${API_BASE}/api/applications/${applicationUuid}/revisions/${revision}/publish`,
  restoreRevision: (applicationUuid: string, revision: number) => `${API_BASE}/api/applications/${applicationUuid}/revisions/${revision}/restore`,
  deleteRevision: (applicationUuid: string, revision: number) => `${API_BASE}/api/applications/${applicationUuid}/revisions/${revision}`,

  // Members
  getApplicationMembers: (appId: string) => `${API_BASE}/api/applications/${appId}/members`,
  getMyMembership: (appId: string) => `${API_BASE}/api/applications/${appId}/members/me`,
  inviteMember: (appId: string) => `${API_BASE}/api/applications/${appId}/members`,
  updateMember: (appId: string, userId: string) => `${API_BASE}/api/applications/${appId}/members/${userId}`,
  removeMember: (appId: string, userId: string) => `${API_BASE}/api/applications/${appId}/members/${userId}`,

  // Pending Invites
  getPendingInvites: (appId: string) => `${API_BASE}/api/applications/${appId}/pending-invites`,
  cancelPendingInvite: (appId: string, inviteId: number) => `${API_BASE}/api/applications/${appId}/pending-invites/${inviteId}`,

  // Roles
  getApplicationRoles: (appId: string) => `${API_BASE}/api/applications/${appId}/roles`,
  getSystemRoles: () => `${API_BASE}/api/roles/system`,
  createRole: (appId: string) => `${API_BASE}/api/applications/${appId}/roles`,
  updateRole: (appId: string, roleId: number) => `${API_BASE}/api/applications/${appId}/roles/${roleId}`,
  deleteRole: (appId: string, roleId: number) => `${API_BASE}/api/applications/${appId}/roles/${roleId}`,

  // Workflows
  getAllWorkflows: () => `${API_BASE}/api/v1/workflows`,
  getWorkflows: (appId: string) => `${API_BASE}/api/v1/workflows?applicationId=${appId}`,
  getWorkflow: (id: string) => `${API_BASE}/api/v1/workflows/${id}`,
  createWorkflow: () => `${API_BASE}/api/v1/workflows`,
  updateWorkflow: (id: string) => `${API_BASE}/api/v1/workflows/${id}`,
  deleteWorkflow: (id: string) => `${API_BASE}/api/v1/workflows/${id}`,
  executeWorkflow: (id: string) => `${API_BASE}/api/v1/workflows/${id}/execute`,
  getWorkflowExecutions: (id: string) => `${API_BASE}/api/v1/workflows/${id}/executions`,
  getWorkflowExecution: (workflowId: string, execId: string) => `${API_BASE}/api/v1/workflows/${workflowId}/executions/${execId}`,
  getNodeExecutions: (workflowId: string, executionId: string) =>
    `${API_BASE}/api/v1/workflows/${workflowId}/executions/${executionId}/nodes`,
  addWorkflowNode: (workflowId: string) => `${API_BASE}/api/v1/workflows/${workflowId}/nodes`,
  updateWorkflowNode: (workflowId: string, nodeId: string) => `${API_BASE}/api/v1/workflows/${workflowId}/nodes/${nodeId}`,
  deleteWorkflowNode: (workflowId: string, nodeId: string) => `${API_BASE}/api/v1/workflows/${workflowId}/nodes/${nodeId}`,
  addWorkflowEdge: (workflowId: string) => `${API_BASE}/api/v1/workflows/${workflowId}/edges`,
  deleteWorkflowEdge: (workflowId: string, edgeId: string) => `${API_BASE}/api/v1/workflows/${workflowId}/edges/${edgeId}`,
  getWorkflowTemplates: () => `${API_BASE}/api/v1/workflows?isTemplate=true`,
  setWorkflowTemplate: (id: string) => `${API_BASE}/api/v1/workflows/${id}/template`,
  createFromTemplate: (id: string) => `${API_BASE}/api/v1/workflows/${id}/create-from-template`,
  cloneWorkflow: (id: string) => `${API_BASE}/api/v1/workflows/${id}/clone`,

  // Whiteboards
  getAllWhiteboards: () => `${API_BASE}/api/v1/whiteboards`,
  getWhiteboards: (appId: string) => `${API_BASE}/api/v1/whiteboards?applicationId=${appId}`,
  getWhiteboard: (id: string) => `${API_BASE}/api/v1/whiteboards/${id}`,
  createWhiteboard: () => `${API_BASE}/api/v1/whiteboards`,
  updateWhiteboard: (id: string) => `${API_BASE}/api/v1/whiteboards/${id}`,
  deleteWhiteboard: (id: string) => `${API_BASE}/api/v1/whiteboards/${id}`,
  // Whiteboard Elements
  addWhiteboardElement: (whiteboardId: string) => `${API_BASE}/api/v1/whiteboards/${whiteboardId}/elements`,
  updateWhiteboardElement: (whiteboardId: string, elementId: string) => `${API_BASE}/api/v1/whiteboards/${whiteboardId}/elements/${elementId}`,
  deleteWhiteboardElement: (whiteboardId: string, elementId: string) => `${API_BASE}/api/v1/whiteboards/${whiteboardId}/elements/${elementId}`,

  // KV Storage (flat entry model)
  getAllKvEntries: (prefix?: string) => {
    const params = new URLSearchParams();
    if (prefix) params.append('prefix', prefix);
    const queryString = params.toString();
    return `${API_BASE}/api/v1/kv/entries${queryString ? `?${queryString}` : ''}`;
  },
  getKvEntries: (appId: string, scope?: string, scopedResourceId?: string, prefix?: string) => {
    const params = new URLSearchParams({ applicationId: appId });
    if (scope) params.append('scope', scope);
    if (scopedResourceId) params.append('scopedResourceId', scopedResourceId);
    if (prefix) params.append('prefix', prefix);
    return `${API_BASE}/api/v1/kv/entries?${params.toString()}`;
  },
  getKvEntry: (appId: string, keyPath: string) =>
    `${API_BASE}/api/v1/kv/entries/${encodeURIComponent(keyPath)}?applicationId=${appId}`,
  setKvEntry: (keyPath: string) =>
    `${API_BASE}/api/v1/kv/entries/${encodeURIComponent(keyPath)}`,
  deleteKvEntry: (appId: string, keyPath: string) =>
    `${API_BASE}/api/v1/kv/entries/${encodeURIComponent(keyPath)}?applicationId=${appId}`,
  rotateKvSecret: (appId: string, keyPath: string) =>
    `${API_BASE}/api/v1/kv/entries/${encodeURIComponent(keyPath)}/rotate?applicationId=${appId}`,
  getKvVersions: (appId: string, keyPath: string) =>
    `${API_BASE}/api/v1/kv/entries/${encodeURIComponent(keyPath)}/versions?applicationId=${appId}`,
  rollbackKvEntry: (appId: string, keyPath: string) =>
    `${API_BASE}/api/v1/kv/entries/${encodeURIComponent(keyPath)}/rollback?applicationId=${appId}`,
  bulkGetKvEntries: (appId: string) =>
    `${API_BASE}/api/v1/kv/bulk/get?applicationId=${appId}`,
  bulkSetKvEntries: (appId: string, scope?: string, scopedResourceId?: string) => {
    const params = new URLSearchParams({ applicationId: appId });
    if (scope) params.append('scope', scope);
    if (scopedResourceId) params.append('scopedResourceId', scopedResourceId);
    return `${API_BASE}/api/v1/kv/bulk/set?${params.toString()}`;
  },
  bulkDeleteKvEntries: (appId: string) =>
    `${API_BASE}/api/v1/kv/bulk/delete?applicationId=${appId}`,

  // Conduit Database Endpoints
  testDbConnection: (appId: string, connectionPath: string) =>
    `${API_BASE}/api/v1/db/test-connection?applicationId=${appId}&connectionPath=${encodeURIComponent(connectionPath)}`,
  testDbConnectionInline: () =>
    `${API_BASE}/api/v1/db/test-connection/inline`,
  listDbSchemas: (appId: string, connectionPath: string) =>
    `${API_BASE}/api/v1/db/schemas?applicationId=${appId}&connectionPath=${encodeURIComponent(connectionPath)}`,
  listDbTables: (appId: string, connectionPath: string, schema?: string) => {
    const params = new URLSearchParams({ applicationId: appId, connectionPath });
    if (schema) params.append('schema', schema);
    return `${API_BASE}/api/v1/db/tables?${params.toString()}`;
  },
  getDbColumns: (appId: string, connectionPath: string, schema: string, table: string) =>
    `${API_BASE}/api/v1/db/columns?applicationId=${appId}&connectionPath=${encodeURIComponent(connectionPath)}&schema=${schema}&table=${table}`,
  getDbRelationships: (appId: string, connectionPath: string, schema: string, table: string) =>
    `${API_BASE}/api/v1/db/relationships?applicationId=${appId}&connectionPath=${encodeURIComponent(connectionPath)}&schema=${schema}&table=${table}`,
  executeDbQuery: (appId: string, connectionPath: string) =>
    `${API_BASE}/api/v1/db/execute?applicationId=${appId}&connectionPath=${encodeURIComponent(connectionPath)}`,
  getDbPoolStats: (appId: string, connectionPath: string) =>
    `${API_BASE}/api/v1/db/pool/stats?applicationId=${appId}&connectionPath=${encodeURIComponent(connectionPath)}`,
  closeDbPool: (appId: string, connectionPath: string) =>
    `${API_BASE}/api/v1/db/pool?applicationId=${appId}&connectionPath=${encodeURIComponent(connectionPath)}`,
  dbHealth: () =>
    `${API_BASE}/api/v1/db/health`,

  // Categories
  getCategories: (applicationId: string, resourceType?: string) => {
    const params = new URLSearchParams({ applicationId });
    if (resourceType) params.append('resourceType', resourceType);
    return `${API_BASE}/api/categories?${params.toString()}`;
  },
  getCategory: (uuid: string) => `${API_BASE}/api/categories/${uuid}`,
  getCategoryTree: (uuid: string) => `${API_BASE}/api/categories/${uuid}/tree`,
  createCategory: () => `${API_BASE}/api/categories`,
  updateCategory: (uuid: string) => `${API_BASE}/api/categories/${uuid}`,
  deleteCategory: (uuid: string) => `${API_BASE}/api/categories/${uuid}`,
  moveCategory: (uuid: string) => `${API_BASE}/api/categories/${uuid}/move`,
  getCategoryResources: (uuid: string) => `${API_BASE}/api/categories/${uuid}/resources`,
  assignCategoryResource: (uuid: string) => `${API_BASE}/api/categories/${uuid}/resources`,
  bulkAssignCategoryResources: (uuid: string) => `${API_BASE}/api/categories/${uuid}/resources/bulk`,
  removeCategoryResource: (uuid: string, resourceId: string, resourceType: string) =>
    `${API_BASE}/api/categories/${uuid}/resources/${resourceId}?resourceType=${resourceType}`,
  findCategoryByResource: (resourceType: string, resourceId: string) =>
    `${API_BASE}/api/categories/resource/${resourceType}/${resourceId}`,

  // Journal Logs Endpoints
  getJournalLogs: (params: {
    service?: string;
    type?: string;
    level?: string;
    correlationId?: string;
    from?: string;
    to?: string;
    dataQuery?: string;
    limit?: number;
    offset?: number;
  }) => {
    const searchParams = new URLSearchParams();
    if (params.service) searchParams.append('service', params.service);
    if (params.type) searchParams.append('type', params.type);
    if (params.level) searchParams.append('level', params.level);
    if (params.correlationId) searchParams.append('correlationId', params.correlationId);
    if (params.from) searchParams.append('from', params.from);
    if (params.to) searchParams.append('to', params.to);
    if (params.dataQuery) searchParams.append('dataQuery', params.dataQuery);
    if (params.limit) searchParams.append('limit', params.limit.toString());
    if (params.offset) searchParams.append('offset', params.offset.toString());
    return `${API_BASE}/api/v1/logs?${searchParams.toString()}`;
  },
  getJournalLog: (id: string) => `${API_BASE}/api/v1/logs/${id}`,
  getJournalExecutionLogs: (executionId: string) =>
    `${API_BASE}/api/v1/logs/execution/${executionId}`,
  getJournalStats: () => `${API_BASE}/api/v1/logs/stats`,
  getJournalTrace: (correlationId: string) =>
    `${API_BASE}/api/v1/logs/trace/${correlationId}`,

  // Workflow Triggers
  getWorkflowTriggers: (workflowId: string) => `${API_BASE}/api/v1/workflows/${workflowId}/trigger-defs`,
  createTrigger: (workflowId: string) => `${API_BASE}/api/v1/workflows/${workflowId}/trigger-defs`,
  updateTrigger: (triggerId: string) => `${API_BASE}/api/v1/triggers/${triggerId}`,
  getTriggerStatus: (triggerId: string) => `${API_BASE}/api/v1/triggers/${triggerId}/status`,
  activateTrigger: (triggerId: string) => `${API_BASE}/api/v1/triggers/${triggerId}/activate`,
  deactivateTrigger: (triggerId: string) => `${API_BASE}/api/v1/triggers/${triggerId}/deactivate`,
  enableDevMode: (triggerId: string) => `${API_BASE}/api/v1/triggers/${triggerId}/dev-mode`,
  disableDevMode: (triggerId: string) => `${API_BASE}/api/v1/triggers/${triggerId}/dev-mode`,
};
