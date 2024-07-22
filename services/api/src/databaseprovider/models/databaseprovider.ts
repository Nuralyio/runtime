
export class Databaseprovider {

    username: string;
    host: string;
    password: string;
    port: number;
    databasename: string;
    provider_type: string;
    user_id: string;
    label: string;

    constructor(username: string, host: string, password: string, port: number, databasename: string, provider_type: string, user_id: string, label: string) {
        this.username = username;
        this.host = host;
        this.password = password;
        this.port = port;
        this.databasename = databasename;
        this.provider_type = provider_type;
        this.user_id = user_id;
        this.label = label;
    }

}
