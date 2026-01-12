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

  // KV Storage
  getKvNamespaces: (appId: string) => `${API_BASE}/api/v1/kv/namespaces?applicationId=${appId}`,
  createKvNamespace: () => `${API_BASE}/api/v1/kv/namespaces`,
  getKvNamespace: (nsId: string) => `${API_BASE}/api/v1/kv/namespaces/${nsId}`,
  updateKvNamespace: (nsId: string) => `${API_BASE}/api/v1/kv/namespaces/${nsId}`,
  deleteKvNamespace: (nsId: string) => `${API_BASE}/api/v1/kv/namespaces/${nsId}`,
  getKvEntries: (nsId: string) => `${API_BASE}/api/v1/kv/${nsId}/entries`,
  getKvEntry: (nsId: string, key: string) => `${API_BASE}/api/v1/kv/${nsId}/entries/${encodeURIComponent(key)}`,
  setKvEntry: (nsId: string, key: string) => `${API_BASE}/api/v1/kv/${nsId}/entries/${encodeURIComponent(key)}`,
  deleteKvEntry: (nsId: string, key: string) => `${API_BASE}/api/v1/kv/${nsId}/entries/${encodeURIComponent(key)}`,
  rotateKvSecret: (nsId: string, key: string) => `${API_BASE}/api/v1/kv/${nsId}/entries/${encodeURIComponent(key)}/rotate`,
  getKvVersions: (nsId: string, key: string) => `${API_BASE}/api/v1/kv/${nsId}/entries/${encodeURIComponent(key)}/versions`,
  rollbackKvEntry: (nsId: string, key: string) => `${API_BASE}/api/v1/kv/${nsId}/entries/${encodeURIComponent(key)}/rollback`,
};
