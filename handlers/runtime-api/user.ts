/**
 * User Management Functions
 *
 * Provides access to the current authenticated user information.
 * The user data is set by the gateway via X-USER header and passed
 * to the client via window.__CURRENT_USER__.
 */

/**
 * User object interface matching the gateway X-USER header structure
 */
export interface CurrentUserInfo {
  uuid: string;
  username: string;
  email: string;
  last_name?: string;
  anonymous: boolean;
  roles: string[];
  /** Application membership role (owner, admin, editor, viewer) - set by SSR */
  appRole?: string;
}

/**
 * Gets the current authenticated user.
 * Returns null if no user is authenticated (anonymous access).
 *
 * @returns The current user object or null if not authenticated
 *
 * @example
 * ```javascript
 * const user = GetCurrentUser();
 * if (user) {
 *   console.log('Welcome', user.username);
 *   console.log('Email:', user.email);
 *   console.log('Roles:', user.roles);
 * } else {
 *   console.log('Not logged in');
 * }
 * ```
 */
export function getCurrentUser(): CurrentUserInfo | null {
  if (typeof window !== 'undefined' && (window as any).__CURRENT_USER__) {
    return (window as any).__CURRENT_USER__;
  }
  return null;
}

/**
 * Creates user-related functions for the runtime API.
 */
export function createUserFunctions() {
  return {
    /**
     * Gets the current authenticated user.
     * @returns User object or null if not authenticated
     */
    GetCurrentUser: getCurrentUser,

    /**
     * Checks if the current user is authenticated (not anonymous).
     * @returns true if user is authenticated, false otherwise
     */
    IsAuthenticated: (): boolean => {
      const user = getCurrentUser();
      return user !== null && !user.anonymous;
    },

    /**
     * Checks if the current user has a specific role.
     * @param role - The role to check for
     * @returns true if user has the role, false otherwise
     */
    HasRole: (role: string): boolean => {
      const user = getCurrentUser();
      return user?.roles?.includes(role) ?? false;
    },

    /**
     * Checks if the current user has any of the specified roles.
     * @param roles - Array of roles to check
     * @returns true if user has at least one of the roles
     */
    HasAnyRole: (roles: string[]): boolean => {
      const user = getCurrentUser();
      if (!user?.roles) return false;
      return roles.some(role => user.roles.includes(role));
    },

    /**
     * Checks if the current user has all of the specified roles.
     * @param roles - Array of roles to check
     * @returns true if user has all of the roles
     */
    HasAllRoles: (roles: string[]): boolean => {
      const user = getCurrentUser();
      if (!user?.roles) return false;
      return roles.every(role => user.roles.includes(role));
    },
  };
}
