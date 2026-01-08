/**
 * Presence Types
 * TypeScript interfaces for real-time presence tracking
 */

export interface PresenceMetadata {
  pageId?: string;
  pageName?: string;
  componentId?: string;
  componentName?: string;
}

export interface PresenceUser {
  userId: string;
  username: string;
  email?: string;
  socketId: string;
  joinedAt: number;
  lastActivity: number;
  metadata: PresenceMetadata;
}

// Socket Events - Client to Server
export interface ClientToServerEvents {
  'join:application': (data: { applicationId: string; metadata?: PresenceMetadata }) => void;
  'leave:application': (data: { applicationId: string }) => void;
  'update:location': (data: { applicationId: string; metadata: PresenceMetadata }) => void;
}

// Socket Events - Server to Client
export interface ServerToClientEvents {
  'user:joined': (data: { user: PresenceUser; applicationId: string }) => void;
  'user:left': (data: { userId: string; socketId: string; applicationId: string }) => void;
  'user:updated': (data: { user: PresenceUser; applicationId: string }) => void;
  'presence:sync': (data: { users: PresenceUser[]; applicationId: string }) => void;
  'error': (data: { message: string; code?: string }) => void;
}

export interface PresenceState {
  connected: boolean;
  currentApplicationId: string | null;
  users: PresenceUser[];
}
