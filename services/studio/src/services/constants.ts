export const APIS_URL = {
    getApplication: (id) => `http://${process.env.NURALY_SERVICES_HOST || "localhost"}/api/applications/${id}`,
    getApplicationPages: (uuid) => `http://${process.env.NURALY_SERVICES_HOST || "localhost"}/api/pages/${uuid}`,
    getPageComponents: (uuid) => `http://${process.env.NURALY_SERVICES_HOST || "localhost"}/api/components/${uuid}`,
    getApplicationPermission: (application_id: string, resource_id: string) => `/api/permissions/${application_id}/${resource_id}`,
}