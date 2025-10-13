/**
 * @license
 * Copyright 2023 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import type { ChatbotPlugin } from '../types.js';

/**
 * PluginService - Handles plugin lifecycle management
 * Registers, unregisters, and executes plugin hooks
 */
export class PluginService {
  private plugins: Map<string, ChatbotPlugin> = new Map();

  constructor(initialPlugins?: ChatbotPlugin[]) {
    if (initialPlugins) {
      initialPlugins.forEach(plugin => this.registerPlugin(plugin));
    }
  }

  /**
   * Register a plugin
   */
  registerPlugin(plugin: ChatbotPlugin, controller?: any): void {
    if (this.plugins.has(plugin.id)) {
      this.log(`Plugin "${plugin.id}" is already registered, skipping`);
      return;
    }

    this.plugins.set(plugin.id, plugin);
    this.log(`Registered plugin: ${plugin.name} v${plugin.version}`);

    // Call plugin initialization hook
    if (plugin.onInit && controller) {
      try {
        plugin.onInit(controller);
      } catch (error) {
        this.logError(`Error initializing plugin "${plugin.id}":`, error);
      }
    }
  }

  /**
   * Unregister a plugin
   */
  unregisterPlugin(pluginId: string): void {
    const plugin = this.plugins.get(pluginId);
    if (plugin && plugin.onDestroy) {
      try {
        plugin.onDestroy();
      } catch (error) {
        this.logError(`Error destroying plugin "${pluginId}":`, error);
      }
    }
    this.plugins.delete(pluginId);
    this.log(`Unregistered plugin: ${pluginId}`);
  }

  /**
   * Get plugin by ID
   */
  getPlugin<T extends ChatbotPlugin = ChatbotPlugin>(pluginId: string): T | undefined {
    return this.plugins.get(pluginId) as T | undefined;
  }

  /**
   * Get all registered plugins
   */
  getAllPlugins(): ChatbotPlugin[] {
    return Array.from(this.plugins.values());
  }

  /**
   * Check if plugin is registered
   */
  hasPlugin(pluginId: string): boolean {
    return this.plugins.has(pluginId);
  }

  /**
   * Get plugins map (for iteration)
   */
  getPluginsMap(): Map<string, ChatbotPlugin> {
    return this.plugins;
  }

  /**
   * Execute a specific hook on all plugins
   */
  async executeHook(hookName: keyof ChatbotPlugin, ...args: any[]): Promise<void> {
    for (const plugin of this.plugins.values()) {
      const hook = plugin[hookName];
      if (typeof hook === 'function') {
        try {
          await (hook as any)(...args);
        } catch (error) {
          this.logError(`Error executing hook "${String(hookName)}" on plugin "${plugin.id}":`, error);
        }
      }
    }
  }

  /**
   * Clear all plugins
   */
  clearPlugins(): void {
    // Destroy all plugins first
    this.plugins.forEach((_plugin, id) => {
      this.unregisterPlugin(id);
    });
    this.plugins.clear();
  }

  /**
   * Get plugin count
   */
  getPluginCount(): number {
    return this.plugins.size;
  }

  /**
   * Log message
   */
  private log(message: string): void {
    console.log(`[PluginService] ${message}`);
  }

  /**
   * Log error
   */
  private logError(message: string, error: any): void {
    console.error(`[PluginService] ${message}`, error);
  }
}
