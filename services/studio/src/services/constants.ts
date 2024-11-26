export const APIS_URL = {
    getApplication: (id: any) => `http://${process.env.NURALY_SERVICES_HOST || "localhost"}/api/applications/${id}`,
    getApplicationComponents: (id: any) => `http://${process.env.NURALY_SERVICES_HOST || "localhost"}/api/components/application/${id}`,
    fetchAllApplications:()=> `http://${process.env.NURALY_SERVICES_HOST || "localhost"}/api/applications`,
    getApplicationPages: (uuid: any) => `http://${process.env.NURALY_SERVICES_HOST || "localhost"}/api/pages/application/${uuid}`,
    getPageComponents: (uuid: any) => `http://${process.env.NURALY_SERVICES_HOST || "localhost"}/api/pages/${uuid}/components`,
    getApplicationPermission: (application_id: string, resource_id: string) => `/api/permissions/${application_id}/${resource_id}`,
}