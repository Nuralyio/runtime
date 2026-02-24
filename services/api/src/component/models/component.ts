

export class Component {

  component: any;
  user_id: string;
  uuid: string;
  application_id: string;

  constructor(component: any, user_id: string, uuid: string, application_id: string) {

    this.component = component;
    this.user_id = user_id;
    this.uuid = uuid;
    this.application_id = application_id;
  }
}
