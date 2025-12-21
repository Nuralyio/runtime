

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
 * The NUser object contains the user's information received from the gateway, which is authenticated by Keycloak.
 * Used in the new access control architecture.
 */
export interface NUser {
  uuid: string;
  username?: string;
  email?: string;
  roles: string[];
  anonymous: boolean;
}


