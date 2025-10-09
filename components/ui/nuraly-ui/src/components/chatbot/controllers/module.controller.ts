/**
 * @license
 * Copyright 2023 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import { ReactiveController, ReactiveControllerHost } from 'lit';
import { ChatbotEventDetail, ChatbotModule } from '../chatbot.types.js';

export interface ChatbotModuleControllerHost extends ReactiveControllerHost {
  modules: ChatbotModule[];
  selectedModules: string[];
  dispatchEventWithMetadata(type: string, detail?: ChatbotEventDetail): void;
}

export class ChatbotModuleController implements ReactiveController {
  constructor(private host: ChatbotModuleControllerHost) {
    host.addController(this);
  }

  hostConnected(): void {}
  hostDisconnected(): void {}

  /**
   * Handle module selection change
   */
  handleModuleSelectionChange(selectedModuleIds: string[]): void {
    this.host.selectedModules = selectedModuleIds.filter(Boolean);
    
    // Get full module objects for selected modules
    const selectedModuleObjects = this.host.selectedModules
      .map(id => this.host.modules.find(m => m.id === id))
      .filter(Boolean) as ChatbotModule[];
    
    // Dispatch event with selected modules
    this.host.dispatchEventWithMetadata('nr-chatbot-modules-selected', {
      metadata: {
        selectedModules: selectedModuleObjects,
        selectedModuleIds: this.host.selectedModules,
      }
    });
    
    this.host.requestUpdate();
  }

  /**
   * Set available modules
   */
  setModules(modules: ChatbotModule[]): void {
    this.host.modules = modules;
    this.host.requestUpdate();
  }

  /**
   * Get selected modules
   */
  getSelectedModules(): ChatbotModule[] {
    return this.host.selectedModules
      .map(id => this.host.modules.find(m => m.id === id))
      .filter(Boolean) as ChatbotModule[];
  }

  /**
   * Set selected modules
   */
  setSelectedModules(moduleIds: string[]): void {
    // Filter to only include valid module IDs
    this.host.selectedModules = moduleIds.filter(id => 
      this.host.modules.some(m => m.id === id)
    );
    this.host.requestUpdate();
  }

  /**
   * Clear module selection
   */
  clearModuleSelection(): void {
    this.host.selectedModules = [];
    this.host.requestUpdate();
  }

  /**
   * Toggle module selection
   */
  toggleModule(moduleId: string): void {
    const index = this.host.selectedModules.indexOf(moduleId);
    if (index > -1) {
      this.host.selectedModules = this.host.selectedModules.filter(id => id !== moduleId);
    } else {
      if (this.host.modules.some(m => m.id === moduleId)) {
        this.host.selectedModules = [...this.host.selectedModules, moduleId];
      }
    }
    this.host.requestUpdate();
  }
}
