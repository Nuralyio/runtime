/**
 * In-memory presence store
 * Simple Map-based storage for presence tracking
 */

import { PresenceUser, PresenceMetadata } from './interfaces/presence.interface';

class PresenceStore {
  // Map<applicationId, Map<socketId, PresenceUser>>
  private applications = new Map<string, Map<string, PresenceUser>>();

  // Map<socketId, applicationId> - for quick cleanup on disconnect
  private socketToApp = new Map<string, string>();

  addUser(applicationId: string, user: PresenceUser): void {
    if (!this.applications.has(applicationId)) {
      this.applications.set(applicationId, new Map());
    }
    this.applications.get(applicationId)!.set(user.socketId, user);
    this.socketToApp.set(user.socketId, applicationId);
  }

  removeUser(socketId: string): { applicationId: string; user: PresenceUser } | null {
    const applicationId = this.socketToApp.get(socketId);
    if (!applicationId) return null;

    const appUsers = this.applications.get(applicationId);
    if (!appUsers) return null;

    const user = appUsers.get(socketId);
    if (!user) return null;

    appUsers.delete(socketId);
    this.socketToApp.delete(socketId);

    // Clean up empty application maps
    if (appUsers.size === 0) {
      this.applications.delete(applicationId);
    }

    return { applicationId, user };
  }

  updateUserLocation(socketId: string, metadata: PresenceMetadata): PresenceUser | null {
    const applicationId = this.socketToApp.get(socketId);
    if (!applicationId) return null;

    const appUsers = this.applications.get(applicationId);
    if (!appUsers) return null;

    const user = appUsers.get(socketId);
    if (!user) return null;

    const updatedUser: PresenceUser = {
      ...user,
      lastActivity: Date.now(),
      metadata: { ...user.metadata, ...metadata },
    };

    appUsers.set(socketId, updatedUser);
    return updatedUser;
  }

  getApplicationUsers(applicationId: string): PresenceUser[] {
    const appUsers = this.applications.get(applicationId);
    if (!appUsers) return [];
    return Array.from(appUsers.values());
  }

  getUserBySocketId(socketId: string): { applicationId: string; user: PresenceUser } | null {
    const applicationId = this.socketToApp.get(socketId);
    if (!applicationId) return null;

    const appUsers = this.applications.get(applicationId);
    if (!appUsers) return null;

    const user = appUsers.get(socketId);
    if (!user) return null;

    return { applicationId, user };
  }

  getApplicationIdBySocket(socketId: string): string | undefined {
    return this.socketToApp.get(socketId);
  }
}

// Singleton instance
export const presenceStore = new PresenceStore();
