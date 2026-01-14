/**
 * @fileoverview Socket Runtime API Functions
 * @module Runtime/Handlers/RuntimeAPI/Socket
 *
 * @description
 * Provides WebSocket connectivity for real-time features like workflow execution tracking.
 *
 * **Architecture:**
 * - Shared socket connection across all instances (efficient resource usage)
 * - Scoped listeners per instance (clean lifecycle management)
 * - Auto-cleanup when last instance disconnects
 *
 * **Usage in Handler Code:**
 * ```javascript
 * // Create a socket instance
 * const socket = $socket.create();
 *
 * // Connect and subscribe
 * socket.connect('/socket.io/workflow')
 *   .subscribe(executionId)
 *   .on('execution:node-started', (data) => {
 *     console.log('Node started:', data.nodeId);
 *   });
 *
 * // Cleanup when done
 * socket.cleanup();
 * ```
 */

import { io, Socket } from 'socket.io-client';

/**
 * Callback type for socket event listeners
 */
type EventCallback = (data: any) => void;

/**
 * Entry tracking which instance owns a listener
 */
interface ListenerEntry {
  callback: EventCallback;
  instanceId: string;
}

/**
 * Shared state across all socket instances
 */
interface SharedSocketState {
  socket: Socket | null;
  listeners: Map<string, ListenerEntry[]>;
  activeInstances: Set<string>;
  currentUrl: string | null;
  currentPath: string | null;
}

/**
 * Shared state - single connection, multiple logical instances
 */
const sharedState: SharedSocketState = {
  socket: null,
  listeners: new Map(),
  activeInstances: new Set(),
  currentUrl: null,
  currentPath: null,
};

/**
 * Counter for generating unique instance IDs
 */
let instanceCounter = 0;

/**
 * Get the API base URL from window.location.origin
 * No hardcoded fallback - must be called in browser context
 */
function getApiBaseUrl(): string {
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  throw new Error('[Socket] Cannot determine API URL - not in browser context');
}

/**
 * Emit event to all listeners for a given event type
 */
function emitToListeners(event: string, data: any): void {
  const listeners = sharedState.listeners.get(event);
  if (listeners) {
    listeners.forEach((entry) => {
      try {
        entry.callback(data);
      } catch (error) {
        console.error(`[Socket] Error in listener for ${event}:`, error);
      }
    });
  }
}

/**
 * Socket instance interface returned by create()
 */
export interface SocketInstance {
  connect(url?: string, path?: string): SocketInstance;
  subscribe(resourceId: string, contextId?: string): SocketInstance;
  unsubscribe(): SocketInstance;
  on(event: string, callback: EventCallback): SocketInstance;
  off(event: string, callback?: EventCallback): SocketInstance;
  emit(event: string, data?: any): SocketInstance;
  cleanup(): void;
  isConnected(): boolean;
  getId(): string;
}

/**
 * Creates a new socket instance with scoped listeners
 */
function createSocketInstance(): SocketInstance {
  const instanceId = `socket_${++instanceCounter}_${Date.now()}`;
  sharedState.activeInstances.add(instanceId);

  let currentSubscription: { resourceId: string; contextId?: string } | null = null;

  const instance: SocketInstance = {
    /**
     * Connect to socket server
     * @param url - Server URL (defaults to API base URL)
     * @param path - Socket.IO path (e.g., '/socket.io/workflow')
     */
    connect(url?: string, path?: string): SocketInstance {
      const targetUrl = url || getApiBaseUrl();
      const targetPath = path || '/socket.io/workflow';

      // If already connected to same URL/path, reuse connection
      if (
        sharedState.socket?.connected &&
        sharedState.currentUrl === targetUrl &&
        sharedState.currentPath === targetPath
      ) {
        return instance;
      }

      // Disconnect existing connection if URL/path changed
      if (sharedState.socket) {
        sharedState.socket.disconnect();
        sharedState.socket = null;
      }

      // Create new connection
      sharedState.socket = io(targetUrl, {
        path: targetPath,
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });

      sharedState.currentUrl = targetUrl;
      sharedState.currentPath = targetPath;

      // Setup core event forwarding
      const coreEvents = [
        'connect',
        'disconnect',
        'connect_error',
        'error',
        // Workflow execution events
        'execution:started',
        'execution:completed',
        'execution:failed',
        'execution:cancelled',
        'execution:node-started',
        'execution:node-completed',
        'execution:node-failed',
        // Presence events (if using same connection)
        'user:joined',
        'user:left',
        'user:updated',
        'presence:sync',
      ];

      coreEvents.forEach((event) => {
        sharedState.socket!.on(event, (data: any) => {
          emitToListeners(event, data);
        });
      });

      // Log connection status
      sharedState.socket.on('connect', () => {
        console.log(`[Socket] Connected: ${instanceId}`);
      });

      sharedState.socket.on('disconnect', (reason) => {
        console.log(`[Socket] Disconnected: ${reason}`);
      });

      sharedState.socket.on('connect_error', (error) => {
        console.error(`[Socket] Connection error:`, error.message);
      });

      return instance;
    },

    /**
     * Subscribe to a resource (e.g., workflow execution)
     * @param resourceId - The resource ID to subscribe to
     * @param contextId - Optional context ID (e.g., workflowId)
     */
    subscribe(resourceId: string, contextId?: string): SocketInstance {
      if (!sharedState.socket) {
        console.warn('[Socket] Not connected. Call connect() first.');
        return instance;
      }

      // Unsubscribe from previous if exists
      if (currentSubscription) {
        sharedState.socket.emit('unsubscribe:execution', {
          executionId: currentSubscription.resourceId,
        });
      }

      currentSubscription = { resourceId, contextId };

      sharedState.socket.emit('subscribe:execution', {
        executionId: resourceId,
      });

      console.log(`[Socket] Subscribed to execution: ${resourceId}`);

      return instance;
    },

    /**
     * Unsubscribe from current resource
     */
    unsubscribe(): SocketInstance {
      if (!sharedState.socket || !currentSubscription) {
        return instance;
      }

      sharedState.socket.emit('unsubscribe:execution', {
        executionId: currentSubscription.resourceId,
      });

      console.log(`[Socket] Unsubscribed from: ${currentSubscription.resourceId}`);
      currentSubscription = null;

      return instance;
    },

    /**
     * Add event listener (scoped to this instance)
     * @param event - Event name
     * @param callback - Callback function
     */
    on(event: string, callback: EventCallback): SocketInstance {
      if (!sharedState.listeners.has(event)) {
        sharedState.listeners.set(event, []);
      }

      sharedState.listeners.get(event)!.push({
        callback,
        instanceId,
      });

      return instance;
    },

    /**
     * Remove event listener(s)
     * @param event - Event name
     * @param callback - Optional specific callback to remove (removes all if not provided)
     */
    off(event: string, callback?: EventCallback): SocketInstance {
      const listeners = sharedState.listeners.get(event);
      if (!listeners) return instance;

      if (callback) {
        // Remove specific callback for this instance
        const filtered = listeners.filter(
          (l) => !(l.instanceId === instanceId && l.callback === callback)
        );
        sharedState.listeners.set(event, filtered);
      } else {
        // Remove all callbacks for this instance on this event
        const filtered = listeners.filter((l) => l.instanceId !== instanceId);
        sharedState.listeners.set(event, filtered);
      }

      return instance;
    },

    /**
     * Emit event to server
     * @param event - Event name
     * @param data - Event data
     */
    emit(event: string, data?: any): SocketInstance {
      if (!sharedState.socket) {
        console.warn('[Socket] Not connected. Call connect() first.');
        return instance;
      }

      sharedState.socket.emit(event, data);
      return instance;
    },

    /**
     * Cleanup this instance (removes only this instance's listeners)
     */
    cleanup(): void {
      // Unsubscribe if subscribed
      if (currentSubscription && sharedState.socket) {
        sharedState.socket.emit('unsubscribe:execution', {
          executionId: currentSubscription.resourceId,
        });
        currentSubscription = null;
      }

      // Remove all listeners owned by this instance
      sharedState.listeners.forEach((listeners, event) => {
        const filtered = listeners.filter((l) => l.instanceId !== instanceId);
        if (filtered.length > 0) {
          sharedState.listeners.set(event, filtered);
        } else {
          sharedState.listeners.delete(event);
        }
      });

      // Remove from active instances
      sharedState.activeInstances.delete(instanceId);

      console.log(`[Socket] Instance cleaned up: ${instanceId}`);

      // Auto-disconnect if no instances remain
      if (sharedState.activeInstances.size === 0 && sharedState.socket) {
        console.log('[Socket] No active instances, disconnecting...');
        sharedState.socket.disconnect();
        sharedState.socket = null;
        sharedState.currentUrl = null;
        sharedState.currentPath = null;
      }
    },

    /**
     * Check if socket is connected
     */
    isConnected(): boolean {
      return sharedState.socket?.connected ?? false;
    },

    /**
     * Get this instance's unique ID
     */
    getId(): string {
      return instanceId;
    },
  };

  return instance;
}

/**
 * Creates socket functions for handler code
 *
 * @returns Object with $socket API
 *
 * @example Usage in handler code
 * ```javascript
 * // Create socket instance
 * const socket = $socket.create();
 *
 * // Connect and setup listeners
 * socket.connect()
 *   .on('execution:node-started', (data) => {
 *     updateNodeStatus(data.nodeId, 'RUNNING');
 *   })
 *   .on('execution:node-completed', (data) => {
 *     updateNodeStatus(data.nodeId, 'COMPLETED');
 *   });
 *
 * // Subscribe to specific execution
 * socket.subscribe(executionId);
 *
 * // Later, cleanup
 * socket.cleanup();
 * ```
 */
export function createSocketFunctions() {
  return {
    $socket: {
      /**
       * Create a new socket instance
       */
      create: createSocketInstance,

      /**
       * Check if any socket is connected
       */
      isConnected(): boolean {
        return sharedState.socket?.connected ?? false;
      },

      /**
       * Get count of active socket instances
       */
      getActiveInstancesCount(): number {
        return sharedState.activeInstances.size;
      },

      /**
       * Force disconnect all sockets
       */
      forceDisconnect(): void {
        if (sharedState.socket) {
          sharedState.socket.disconnect();
          sharedState.socket = null;
          sharedState.currentUrl = null;
          sharedState.currentPath = null;
          sharedState.listeners.clear();
          sharedState.activeInstances.clear();
          console.log('[Socket] Force disconnected all instances');
        }
      },
    },
  };
}
