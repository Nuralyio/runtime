/**
 * @license
 * Copyright 2023 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import { ReactiveControllerHost } from 'lit';
import { CollapseSection } from '../collapse.type.js';
import { BaseComponentController } from '@nuralyui/common/controllers';

/**
 * Base controller interface for collapse components
 */
export interface CollapseControllerHost extends ReactiveControllerHost {
  sections: CollapseSection[];
  accordion?: boolean;
  allowMultiple?: boolean;
  animation?: string;
  requestUpdate(): void;
  updateSection?(index: number, updates: Partial<CollapseSection>): void;
  updateSections?(updates: Array<{ index: number; updates: Partial<CollapseSection> }>): void;
}

/**
 * Base controller for collapse component functionality
 */
export abstract class BaseCollapseController extends BaseComponentController<CollapseControllerHost> {

  /**
   * Get section by index safely
   */
  protected getSection(index: number): CollapseSection | undefined {
    return this.host.sections[index];
  }

  /**
   * Update a specific section
   */
  protected updateSection(index: number, updates: Partial<CollapseSection>): void {
    // Use the host's updateSection method if available (preferred for consistency)
    if (this.host.updateSection) {
      this.host.updateSection(index, updates);
      return;
    }

    // Fallback to direct update
    const section = this.getSection(index);
    if (section) {
      // Create a new array with the updated section to trigger reactivity
      const newSections = [...this.host.sections];
      newSections[index] = { ...section, ...updates };
      this.host.sections = newSections;
      this.host.requestUpdate();
    }
  }

  /**
   * Update multiple sections at once (more efficient for batch operations)
   */
  protected updateSections(updates: Array<{ index: number; updates: Partial<CollapseSection> }>): void {
    // Use the host's updateSections method if available (preferred for consistency)
    if (this.host.updateSections) {
      this.host.updateSections(updates);
      return;
    }

    // Fallback to direct batch update
    const newSections = [...this.host.sections];
    let hasChanges = false;

    updates.forEach(({ index, updates: sectionUpdates }) => {
      const section = this.getSection(index);
      if (section) {
        newSections[index] = { ...section, ...sectionUpdates };
        hasChanges = true;
      }
    });

    if (hasChanges) {
      this.host.sections = newSections;
      this.host.requestUpdate();
    }
  }

  /**
   * Get all open sections
   */
  protected getOpenSections(): number[] {
    return this.host.sections
      .map((section, index) => section.open ? index : -1)
      .filter(index => index !== -1);
  }
}
