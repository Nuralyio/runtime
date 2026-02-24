/**
 * Presence module interfaces
 * Types for real-time presence tracking
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

export interface PresenceState {
  applicationId: string;
  users: PresenceUser[];
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

// Socket Data stored on socket instance
export interface SocketData {
  userId: string;
  username: string;
  email?: string;
  anonymous: boolean;
  roles: string[];
  currentApplicationId?: string;
}

// Redis key patterns
export const REDIS_KEYS = {
  APP_USERS: (appId: string) => `presence:app:${appId}:users`,
  SOCKET_USER: (socketId: string) => `presence:socket:${socketId}`,
  HEARTBEAT: (socketId: string) => `presence:heartbeat:${socketId}`,
} as const;

// Configuration constants
export const PRESENCE_CONFIG = {
  HEARTBEAT_INTERVAL: 25000, // 25 seconds
  HEARTBEAT_TTL: 30, // 30 seconds TTL in Redis
  CLEANUP_INTERVAL: 60000, // 1 minute cleanup check
} as const;
