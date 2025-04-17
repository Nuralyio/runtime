export class Page {

    name: string;
    url: string;
    description: string;
    application_id: string;
    user_id: string;
    uuid: string;
    need_authentification: boolean;
    component_ids: string [];
    style : any;

    constructor(name: string, url: string, description:string, application_id: string, user_id: string, uuid: string, need_authentification: boolean, component_ids: string [],style : any= {}) {
        this.style = style;
        this.name = name;
        this.url = url;
        this.description = description;
        this.application_id = application_id;
        this.user_id = user_id;
        this.uuid = uuid;
        this.need_authentification = need_authentification;
        this.component_ids = component_ids;
    }
}