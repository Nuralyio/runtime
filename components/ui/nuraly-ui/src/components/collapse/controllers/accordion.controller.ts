/**
 * @license
 * Copyright 2023 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import { BaseCollapseController, CollapseControllerHost } from './base.controller.js';

/**
 * Extended host interface for accordion functionality
 */
export interface CollapseAccordionHost extends CollapseControllerHost {
  accordion?: boolean;
  allowMultiple?: boolean;
}

/**
 * Accordion controller for collapse component
 * Handles accordion behavior (single section open at a time)
 */
export class CollapseAccordionController extends BaseCollapseController {

  /**
   * Handle section toggle with accordion logic
   */
  handleSectionToggle(index: number, isOpening: boolean): void {
    if (!this.host.accordion) {
      // Not in accordion mode, allow normal toggle
      return;
    }

    if (isOpening && !this.host.allowMultiple) {
      // Close all other sections when opening one in accordion mode
      this.closeOtherSections(index);
    }
  }

  /**
   * Close all sections except the specified one
   */
  private closeOtherSections(exceptIndex: number): void {
    this.host.sections.forEach((section, index) => {
      if (index !== exceptIndex && section.open && section.collapsible !== false) {
        this.updateSection(index, { open: false });
      }
    });
  }

  /**
   * Ensure only one section is open (accordion mode)
   */
  enforceAccordionMode(): void {
    if (!this.host.accordion || this.host.allowMultiple) {
      return;
    }

    const openSections = this.getOpenSections();
    
    // If more than one section is open, close all but the first
    if (openSections.length > 1) {
      const sectionsToUpdate = openSections.slice(1).map(index => ({
        index,
        updates: { open: false }
      }));
      this.updateSections(sectionsToUpdate);
    }
  }

  /**
   * Open specific section (accordion mode)
   */
  openSection(index: number): void {
    const section = this.getSection(index);
    if (!section || section.disabled || section.collapsible === false) {
      return;
    }

    if (this.host.accordion && !this.host.allowMultiple) {
      // Close all other sections first
      this.closeOtherSections(index);
    }

    this.updateSection(index, { open: true });
  }

  /**
   * Close specific section
   */
  closeSection(index: number): void {
    const section = this.getSection(index);
    if (!section || section.disabled || section.collapsible === false) {
      return;
    }

    this.updateSection(index, { open: false });
  }

  /**
   * Close all sections
   */
  closeAllSections(): void {
    const sectionsToUpdate = this.host.sections
      .map((section, index) => ({ section, index }))
      .filter(({ section }) => section.open && section.collapsible !== false && !section.disabled)
      .map(({ index }) => ({ index, updates: { open: false } }));
    
    if (sectionsToUpdate.length > 0) {
      this.updateSections(sectionsToUpdate);
    }
  }

  /**
   * Open all sections (only if not in accordion mode or allowMultiple is true)
   */
  openAllSections(): void {
    if (this.host.accordion && !this.host.allowMultiple) {
      // In accordion mode with single selection, open only the first valid section
      const firstValidIndex = this.host.sections.findIndex(
        section => section.collapsible !== false && !section.disabled
      );
      
      if (firstValidIndex !== -1) {
        this.openSection(firstValidIndex);
      }
      return;
    }

    // Open all valid sections
    const sectionsToUpdate = this.host.sections
      .map((section, index) => ({ section, index }))
      .filter(({ section }) => !section.open && section.collapsible !== false && !section.disabled)
      .map(({ index }) => ({ index, updates: { open: true } }));
    
    if (sectionsToUpdate.length > 0) {
      this.updateSections(sectionsToUpdate);
    }
  }

  /**
   * Get the currently active (open) section in accordion mode
   */
  getActiveSectionIndex(): number {
    if (!this.host.accordion) {
      return -1;
    }

    const openSections = this.getOpenSections();
    return openSections.length > 0 ? openSections[0] : -1;
  }

  /**
   * Check if accordion mode is enabled
   */
  isAccordionMode(): boolean {
    return !!this.host.accordion;
  }

  /**
   * Check if multiple sections can be open
   */
  allowsMultiple(): boolean {
    return !!this.host.allowMultiple;
  }
}