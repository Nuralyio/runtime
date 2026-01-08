/**
 * Presence Client
 * Socket.IO client wrapper for real-time presence
 */

import { io, Socket } from 'socket.io-client';
import type {
  ClientToServerEvents,
  ServerToClientEvents,
  PresenceMetadata,
} from './presence-types';
import {
  setPresenceConnected,
  setCurrentApplicationId,
  setPresenceUsers,
  addPresenceUser,
  removePresenceUser,
  updatePresenceUser,
  clearPresenceUsers,
} from './presence-store';

type PresenceSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

class PresenceClient {
  private socket: PresenceSocket | null = null;
  private currentApplicationId: string | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  /**
   * Connect to the presence server
   */
  connect(): void {
    if (this.socket?.connected) {
      console.log('[Presence] Already connected');
      return;
    }

    // Determine WebSocket URL based on environment
    const wsUrl = this.getWebSocketUrl();

    console.log('[Presence] Connecting to', wsUrl);

    this.socket = io(wsUrl, {
      path: '/socket.io/presence',
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });

    this.setupEventListeners();
  }

  private getWebSocketUrl(): string {
    // In browser, connect to same origin (gateway will proxy)
    if (typeof window !== 'undefined') {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      return `${protocol}//${window.location.host}`;
    }
    // Fallback for SSR (should not be used)
    return 'ws://localhost:3000';
  }

  private setupEventListeners(): void {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('[Presence] Connected');
      setPresenceConnected(true);
      this.reconnectAttempts = 0;

      // Rejoin application if we were in one
      if (this.currentApplicationId) {
        this.joinApplication(this.currentApplicationId);
      }
    });

    this.socket.on('disconnect', (reason) => {
      console.log('[Presence] Disconnected:', reason);
      setPresenceConnected(false);
      clearPresenceUsers();
    });

    this.socket.on('connect_error', (error) => {
      console.error('[Presence] Connection error:', error.message);
      this.reconnectAttempts++;

      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.error('[Presence] Max reconnection attempts reached');
      }
    });

    // Presence events
    this.socket.on('presence:sync', ({ users, applicationId }) => {
      console.log('[Presence] Sync received:', users.length, 'users');
      setPresenceUsers(users);
    });

    this.socket.on('user:joined', ({ user, applicationId }) => {
      console.log('[Presence] User joined:', user.username);
      addPresenceUser(user);
    });

    this.socket.on('user:left', ({ userId, socketId, applicationId }) => {
      console.log('[Presence] User left:', userId);
      removePresenceUser(socketId);
    });

    this.socket.on('user:updated', ({ user, applicationId }) => {
      console.log('[Presence] User updated:', user.username);
      updatePresenceUser(user);
    });

    this.socket.on('error', ({ message, code }) => {
      console.error('[Presence] Error:', message, code);
    });
  }

  /**
   * Join an application room
   */
  joinApplication(applicationId: string, metadata?: PresenceMetadata): void {
    if (!this.socket?.connected) {
      console.warn('[Presence] Not connected, cannot join application');
      this.currentApplicationId = applicationId; // Save for reconnect
      return;
    }

    // Leave previous application if different
    if (this.currentApplicationId && this.currentApplicationId !== applicationId) {
      this.leaveApplication(this.currentApplicationId);
    }

    console.log('[Presence] Joining application:', applicationId);
    this.socket.emit('join:application', { applicationId, metadata });
    this.currentApplicationId = applicationId;
    setCurrentApplicationId(applicationId);
  }

  /**
   * Leave an application room
   */
  leaveApplication(applicationId?: string): void {
    const appId = applicationId || this.currentApplicationId;
    if (!appId) return;

    if (this.socket?.connected) {
      console.log('[Presence] Leaving application:', appId);
      this.socket.emit('leave:application', { applicationId: appId });
    }

    if (appId === this.currentApplicationId) {
      this.currentApplicationId = null;
      setCurrentApplicationId(null);
      clearPresenceUsers();
    }
  }

  /**
   * Update current location (page/component being viewed)
   */
  updateLocation(metadata: PresenceMetadata): void {
    if (!this.socket?.connected || !this.currentApplicationId) {
      return;
    }

    this.socket.emit('update:location', {
      applicationId: this.currentApplicationId,
      metadata,
    });
  }

  /**
   * Disconnect from presence server
   */
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.currentApplicationId = null;
    setPresenceConnected(false);
    clearPresenceUsers();
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.socket?.connected ?? false;
  }

  /**
   * Get current application ID
   */
  getCurrentApplicationId(): string | null {
    return this.currentApplicationId;
  }
}

// Singleton instance
export const presenceClient = new PresenceClient();
