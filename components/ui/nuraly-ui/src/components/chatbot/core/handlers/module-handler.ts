/**
 * @license
 * Copyright 2023 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import { EventBus } from '../event-bus.js';
import { StateHandler } from './state-handler.js';
import type { ChatbotModule } from '../../chatbot.types.js';

/**
 * ModuleHandler - Handles module selection
 * Manages module list and selection state
 */
export class ModuleHandler {
  constructor(
    private stateHandler: StateHandler,
    private eventBus: EventBus
  ) {}

  setModules(modules: ChatbotModule[]): void {
    this.stateHandler.updateState({ modules });
  }

  selectModules(moduleIds: string[]): void {
    this.stateHandler.updateState({ selectedModules: moduleIds });
    this.eventBus.emit('module:selected', moduleIds);
  }

  toggleModule(moduleId: string): void {
    const state = this.stateHandler.getState();
    const isSelected = state.selectedModules.includes(moduleId);
    
    const newSelection = isSelected
      ? state.selectedModules.filter(id => id !== moduleId)
      : [...state.selectedModules, moduleId];
    
    this.selectModules(newSelection);
  }

  getSelectedModules(): ChatbotModule[] {
    const state = this.stateHandler.getState();
    return (state.modules || []).filter(m => state.selectedModules.includes(m.id));
  }

  clearSelection(): void {
    this.stateHandler.updateState({ selectedModules: [] });
  }
}
