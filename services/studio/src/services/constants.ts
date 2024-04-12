export const APIS_URL = {
    getApplication: (id) => `http://${process.env.NURALY_SERVICES_HOST || "nuraly.io"}/api/applications/${id}`,
    getApplications:()=> `http://${process.env.NURALY_SERVICES_HOST || "nuraly.io"}/api/applications`,
    getApplicationPages: (uuid) => `http://${process.env.NURALY_SERVICES_HOST || "nuraly.io"}/api/pages/${uuid}`,
    getPageComponents: (uuid) => `http://${process.env.NURALY_SERVICES_HOST || "nuraly.io"}/api/components/${uuid}`,
    getApplicationPermission: (application_id: string, resource_id: string) => `/api/permissions/${application_id}/${resource_id}`,
}