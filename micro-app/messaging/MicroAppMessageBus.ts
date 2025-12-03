/**
 * Micro-App Message Bus
 *
 * Provides structured communication between micro-app instances.
 * Supports direct messaging and broadcasting.
 */

export interface Message {
  from: string  // sender microAppId
  to?: string  // target microAppId (optional, broadcast if undefined)
  type: string
  payload: any
  timestamp: number
}

export type MessageHandler = (message: Message) => void

export class MicroAppMessageBus {
  private static instance: MicroAppMessageBus
  private channels: Map<string, Set<MessageHandler>> = new Map()
  private messageHistory: Message[] = []
  private maxHistorySize: number = 100

  private constructor() {}

  /**
   * Get singleton instance
   */
  static getInstance(): MicroAppMessageBus {
    if (!MicroAppMessageBus.instance) {
      MicroAppMessageBus.instance = new MicroAppMessageBus()
    }
    return MicroAppMessageBus.instance
  }

  /**
   * Send message to specific micro-app or broadcast
   */
  send(message: Omit<Message, 'timestamp'>): void {
    const fullMessage: Message = {
      ...message,
      timestamp: Date.now()
    }

    // Store in history
    this.addToHistory(fullMessage)

    if (message.to) {
      // Direct message
      const channel = `microapp:${message.to}`
      this.emit(channel, fullMessage)
    } else {
      // Broadcast to all
      this.broadcast(fullMessage)
    }
  }

  /**
   * Subscribe to messages for a micro-app
   */
  subscribe(microAppId: string, handler: MessageHandler): () => void {
    // Subscribe to direct messages
    const directChannel = `microapp:${microAppId}`
    if (!this.channels.has(directChannel)) {
      this.channels.set(directChannel, new Set())
    }
    this.channels.get(directChannel)!.add(handler)

    // Subscribe to broadcast channel
    const broadcastChannel = 'microapp:broadcast'
    if (!this.channels.has(broadcastChannel)) {
      this.channels.set(broadcastChannel, new Set())
    }
    this.channels.get(broadcastChannel)!.add(handler)

    // Return unsubscribe function
    return () => {
      this.channels.get(directChannel)?.delete(handler)
      this.channels.get(broadcastChannel)?.delete(handler)

      // Cleanup empty channels
      if (this.channels.get(directChannel)?.size === 0) {
        this.channels.delete(directChannel)
      }
      if (this.channels.get(broadcastChannel)?.size === 0) {
        this.channels.delete(broadcastChannel)
      }
    }
  }

  /**
   * Subscribe to specific message types
   */
  subscribeToType(microAppId: string, messageType: string, handler: MessageHandler): () => void {
    const wrappedHandler: MessageHandler = (message) => {
      if (message.type === messageType) {
        handler(message)
      }
    }

    return this.subscribe(microAppId, wrappedHandler)
  }

  /**
   * Emit message to specific channel
   */
  private emit(channel: string, message: Message): void {
    const handlers = this.channels.get(channel)
    if (handlers) {
      // Create a copy of handlers to avoid issues if handlers are removed during iteration
      const handlersCopy = Array.from(handlers)
      handlersCopy.forEach(handler => {
        try {
          handler(message)
        } catch (error) {
          console.error(`Error in message handler for channel ${channel}:`, error)
        }
      })
    }
  }

  /**
   * Broadcast message to all subscribed micro-apps
   */
  private broadcast(message: Message): void {
    this.emit('microapp:broadcast', message)
  }

  /**
   * Get recent message history
   */
  getHistory(limit?: number): Message[] {
    if (limit) {
      return this.messageHistory.slice(-limit)
    }
    return [...this.messageHistory]
  }

  /**
   * Get message history filtered by type
   */
  getHistoryByType(messageType: string, limit?: number): Message[] {
    const filtered = this.messageHistory.filter(m => m.type === messageType)
    if (limit) {
      return filtered.slice(-limit)
    }
    return filtered
  }

  /**
   * Get message history filtered by sender
   */
  getHistoryBySender(microAppId: string, limit?: number): Message[] {
    const filtered = this.messageHistory.filter(m => m.from === microAppId)
    if (limit) {
      return filtered.slice(-limit)
    }
    return filtered
  }

  /**
   * Add message to history
   */
  private addToHistory(message: Message): void {
    this.messageHistory.push(message)

    // Trim history if exceeds max size
    if (this.messageHistory.length > this.maxHistorySize) {
      this.messageHistory = this.messageHistory.slice(-this.maxHistorySize)
    }
  }

  /**
   * Clear message history
   */
  clearHistory(): void {
    this.messageHistory = []
  }

  /**
   * Clear all channels and history
   */
  clearAll(): void {
    this.channels.clear()
    this.messageHistory = []
  }

  /**
   * Get active channels
   */
  getActiveChannels(): string[] {
    return Array.from(this.channels.keys())
  }

  /**
   * Debug helper
   */
  getDebugInfo(): any {
    return {
      channelCount: this.channels.size,
      channels: Array.from(this.channels.entries()).map(([channel, handlers]) => ({
        channel,
        handlerCount: handlers.size
      })),
      messageHistorySize: this.messageHistory.length,
      recentMessages: this.messageHistory.slice(-10)
    }
  }
}

/**
 * Common message types
 */
export const MessageTypes = {
  // Selection events
  FILE_SELECTED: 'FILE_SELECTED',
  FOLDER_SELECTED: 'FOLDER_SELECTED',
  COMPONENT_SELECTED: 'COMPONENT_SELECTED',

  // Data events
  DATA_UPDATED: 'DATA_UPDATED',
  DATA_LOADED: 'DATA_LOADED',
  DATA_SAVED: 'DATA_SAVED',

  // Navigation events
  PAGE_CHANGED: 'PAGE_CHANGED',
  ROUTE_CHANGED: 'ROUTE_CHANGED',

  // State events
  STATE_CHANGED: 'STATE_CHANGED',
  CONFIG_CHANGED: 'CONFIG_CHANGED',

  // Action events
  ACTION_EXECUTED: 'ACTION_EXECUTED',
  ACTION_COMPLETED: 'ACTION_COMPLETED',
  ACTION_FAILED: 'ACTION_FAILED',

  // Lifecycle events
  MICRO_APP_MOUNTED: 'MICRO_APP_MOUNTED',
  MICRO_APP_UNMOUNTING: 'MICRO_APP_UNMOUNTING',

  // Custom events
  CUSTOM: 'CUSTOM'
} as const

export type MessageType = typeof MessageTypes[keyof typeof MessageTypes]
