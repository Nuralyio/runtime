export const APIS_URL = {
    getApplication:(id)=>`http://${process.env.NURALY_SERVICES_HOST || "localhost"}/api/applications/${id}`,
}