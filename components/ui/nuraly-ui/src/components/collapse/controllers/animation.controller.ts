/**
 * @license
 * Copyright 2023 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import { BaseCollapseController, CollapseControllerHost } from './base.controller.js';

/**
 * Animation controller for collapse component
 * Handles smooth expand/collapse animations
 */
export class CollapseAnimationController extends BaseCollapseController {
  private animatingSections = new Set<number>();
  private animationDuration = 300; // ms

  constructor(host: CollapseControllerHost) {
    super(host);
  }

  /**
   * Animate section toggle
   */
  async animateToggle(index: number, isOpening: boolean): Promise<void> {
    const section = this.getSection(index);
    if (!section || this.animatingSections.has(index)) {
      return;
    }

    this.animatingSections.add(index);

    try {
      const contentElement = this.getContentElement(index);
      if (!contentElement) return;

      if (isOpening) {
        await this.animateExpand(contentElement);
      } else {
        await this.animateCollapse(contentElement);
      }
    } finally {
      this.animatingSections.delete(index);
    }
  }

  /**
   * Animate expand
   */
  private async animateExpand(element: HTMLElement): Promise<void> {
    const fullHeight = element.scrollHeight;
    
    element.style.height = '0px';
    element.style.overflow = 'hidden';
    element.style.transition = `height ${this.animationDuration}ms ease-out`;

    // Force reflow
    element.offsetHeight;

    element.style.height = `${fullHeight}px`;

    return new Promise((resolve) => {
      const handleTransitionEnd = () => {
        element.style.height = '';
        element.style.overflow = '';
        element.style.transition = '';
        element.removeEventListener('transitionend', handleTransitionEnd);
        resolve();
      };

      element.addEventListener('transitionend', handleTransitionEnd);
      
      // Fallback timeout
      setTimeout(handleTransitionEnd, this.animationDuration + 50);
    });
  }

  /**
   * Animate collapse
   */
  private async animateCollapse(element: HTMLElement): Promise<void> {
    const currentHeight = element.scrollHeight;
    
    element.style.height = `${currentHeight}px`;
    element.style.overflow = 'hidden';
    element.style.transition = `height ${this.animationDuration}ms ease-out`;

    // Force reflow
    element.offsetHeight;

    element.style.height = '0px';

    return new Promise((resolve) => {
      const handleTransitionEnd = () => {
        element.style.height = '';
        element.style.overflow = '';
        element.style.transition = '';
        element.removeEventListener('transitionend', handleTransitionEnd);
        resolve();
      };

      element.addEventListener('transitionend', handleTransitionEnd);
      
      // Fallback timeout
      setTimeout(handleTransitionEnd, this.animationDuration + 50);
    });
  }

  /**
   * Get content element for a section
   */
  private getContentElement(index: number): HTMLElement | null {
    const hostElement = this.host as unknown as HTMLElement;
    return hostElement.shadowRoot?.querySelector(`.collapse-content[data-section-index="${index}"]`) as HTMLElement || null;
  }

  /**
   * Check if section is currently animating
   */
  isAnimating(index: number): boolean {
    return this.animatingSections.has(index);
  }

  /**
   * Set animation duration
   */
  setAnimationDuration(duration: number): void {
    this.animationDuration = Math.max(0, duration);
  }
}