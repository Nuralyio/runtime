export const APIS_URL = {
    getApplication: (id) => `http://${process.env.NURALY_SERVICES_HOST || "localhost"}/api/applications/${id}`,
    getApplicationComponents: (id) => `http://${process.env.NURALY_SERVICES_HOST || "localhost"}/api/components/application/${id}`,
    getApplications:()=> `http://${process.env.NURALY_SERVICES_HOST || "localhost"}/api/applications`,
    getApplicationPages: (uuid) => `http://${process.env.NURALY_SERVICES_HOST || "localhost"}/api/pages/application/${uuid}`,
    getPageComponents: (uuid) => `http://${process.env.NURALY_SERVICES_HOST || "localhost"}/api/pages/${uuid}/components`,
    getApplicationPermission: (application_id: string, resource_id: string) => `/api/permissions/${application_id}/${resource_id}`,
}