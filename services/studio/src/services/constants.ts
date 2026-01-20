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
  getWorkflows: (appId: string) => `${API_BASE}/api/v1/workflows?applicationId=${appId}`,
  getWorkflow: (id: string) => `${API_BASE}/api/v1/workflows/${id}`,
  createWorkflow: () => `${API_BASE}/api/v1/workflows`,
  updateWorkflow: (id: string) => `${API_BASE}/api/v1/workflows/${id}`,
  deleteWorkflow: (id: string) => `${API_BASE}/api/v1/workflows/${id}`,
  executeWorkflow: (id: string) => `${API_BASE}/api/v1/workflows/${id}/execute`,
  getWorkflowExecutions: (id: string) => `${API_BASE}/api/v1/workflows/${id}/executions`,
  getWorkflowExecution: (execId: string) => `${API_BASE}/api/v1/executions/${execId}`,
  addWorkflowNode: (workflowId: string) => `${API_BASE}/api/v1/workflows/${workflowId}/nodes`,
  updateWorkflowNode: (workflowId: string, nodeId: string) => `${API_BASE}/api/v1/workflows/${workflowId}/nodes/${nodeId}`,
  deleteWorkflowNode: (workflowId: string, nodeId: string) => `${API_BASE}/api/v1/workflows/${workflowId}/nodes/${nodeId}`,
  addWorkflowEdge: (workflowId: string) => `${API_BASE}/api/v1/workflows/${workflowId}/edges`,
  deleteWorkflowEdge: (workflowId: string, edgeId: string) => `${API_BASE}/api/v1/workflows/${workflowId}/edges/${edgeId}`,

  // KV Storage (flat entry model)
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
};
