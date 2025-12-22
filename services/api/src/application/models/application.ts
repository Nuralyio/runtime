export class Application {

    published?: boolean | null;
    uuid: string;
    user_id: string;
    name: string;
    subdomain?: string | null;

    constructor(published: boolean, name: string, uuid: string, user_id: string, subdomain?: string | null) {

      this.published = published;
      this.name = name;
      this.uuid = uuid;
      this.user_id = user_id;
      this.subdomain = subdomain;
    }
  }
  