// Use gateway hostname for SSR context (inside docker), and relative path for client-side
const API_BASE = typeof window === 'undefined'
  ? `http://${process.env.NURALY_SERVICES_HOST || "gateway"}`
  : '';

export const APIS_URL = {
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
  createRevision: (applicationUuid: string) => `${API_BASE}/api/applications/${applicationUuid}/revisions`,
  publishRevision: (applicationUuid: string, revision: number) => `${API_BASE}/api/applications/${applicationUuid}/revisions/${revision}/publish`,
  restoreRevision: (applicationUuid: string, revision: number) => `${API_BASE}/api/applications/${applicationUuid}/revisions/${revision}/restore`,
  deleteRevision: (applicationUuid: string, revision: number) => `${API_BASE}/api/applications/${applicationUuid}/revisions/${revision}`
};
