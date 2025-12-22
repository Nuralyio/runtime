

export class User {
  id?: string;
  keycloakId?: string;
  name: string;
  email: string;

  constructor(keycloakId: string | undefined | null, name: string, email: string, id?: string) {
    this.id = id;
    this.keycloakId = keycloakId ?? undefined;
    this.name = name;
    this.email = email;
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


