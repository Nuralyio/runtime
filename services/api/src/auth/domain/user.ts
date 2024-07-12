

export class User {
  id?: string;
  name: string;
  email: string;
  password: string;

  constructor(name: string, email: string, password: string, id?: string) {
    this.id = id;
    this.name = name;
    this.email = email;
    this.password = password;
  }
}


/**
 *  The NUser object contains the user’s information received from the gateway, which is authenticated by Keycloak.
 */
export class NUser {
  uuid: string;
  roles : any[];

  constructor(uuid: string, roles: string[]) {
    this.uuid = uuid;
    this.roles = roles;
  }
}


