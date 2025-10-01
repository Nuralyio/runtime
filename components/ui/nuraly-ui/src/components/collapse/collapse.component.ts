/**
 * @license
 * Copyright 2023 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import { html, LitElement, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import {
  CollapseSection,
  CollapseSize,
  CollapseVariant,
  CollapseAnimation,
  CollapseSectionToggleEvent,
  CollapseBeforeToggleEvent,
  EMPTY_STRING
} from './collapse.type.js';
import { styles } from './collapse.style.js';
import { NuralyUIBaseMixin } from '../../shared/base-mixin.js';
import { map } from 'lit/directives/map.js';
import { classMap } from 'lit/directives/class-map.js';
import { ifDefined } from 'lit/directives/if-defined.js';

// Import icon component
import '../icon/icon.component.js';

// Import controllers
import {
  CollapseAnimationController,
  CollapseAccordionController
} from './controllers/index.js';

/**
 * Versatile collapse/accordion component with multiple variants, animations, and accessibility features.
 * 
 * @example
 * ```html
 * <nr-collapse
 *   .sections="${sections}"
 *   size="medium"
 *   variant="default"
 *   accordion
 * ></nr-collapse>
 * ```
 * 
 * @element nr-collapse
 * @fires section-toggle - Fired when a section is toggled
 * @fires section-before-toggle - Fired before a section is toggled (cancellable)
 */
@customElement('nr-collapse')
export class HyCollapse extends NuralyUIBaseMixin(LitElement) {
  static override styles = styles;
  override requiredComponents = ['nr-icon'];

  // Controllers
  private animationController = new CollapseAnimationController(this);
  private accordionController = new CollapseAccordionController(this);

  // Public properties
  @property({ type: Array }) sections: CollapseSection[] = [];
  @property({ type: String }) size: CollapseSize = CollapseSize.Medium;
  @property({ type: String }) variant: CollapseVariant = CollapseVariant.Default;
  @property({ type: String }) animation: CollapseAnimation = CollapseAnimation.Slide;
  @property({ type: Boolean }) accordion = false;
  @property({ type: Boolean, attribute: 'allow-multiple' }) allowMultiple = false;
  @property({ type: Boolean }) disabled = false;
  @property({ type: String, attribute: 'expand-icon' }) expandIcon = 'chevron-right';
  @property({ type: String, attribute: 'collapse-icon' }) collapseIcon = 'chevron-down';

  override connectedCallback(): void {
    super.connectedCallback();
    
    // Listen for internal events from controllers
    this.addEventListener('section-toggle-requested', this.handleToggleRequest as EventListener);
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.removeEventListener('section-toggle-requested', this.handleToggleRequest as EventListener);
  }

  override updated(changedProperties: Map<string, any>): void {
    super.updated(changedProperties);
    
    if (changedProperties.has('accordion') || changedProperties.has('allowMultiple')) {
      this.accordionController.enforceAccordionMode();
    }
  }

  /**
   * Toggle a section by index
   */
  async toggleSection(index: number): Promise<void> {
    const section = this.sections[index];
    if (!section || section.disabled || section.collapsible === false) {
      return;
    }

    const isCurrentlyOpen = !!section.open;
    const willBeOpen = !isCurrentlyOpen;

    // Dispatch before-toggle event (cancellable)
    const beforeToggleEvent: CustomEvent<CollapseBeforeToggleEvent> = new CustomEvent<CollapseBeforeToggleEvent>('section-before-toggle', {
      detail: {
        index,
        section,
        isOpen: isCurrentlyOpen,
        preventDefault: () => beforeToggleEvent.preventDefault()
      },
      cancelable: true,
      bubbles: true
    });

    if (!this.dispatchEvent(beforeToggleEvent)) {
      return; // Event was cancelled
    }

    // Handle accordion logic
    this.accordionController.handleSectionToggle(index, willBeOpen);

    // Update section state
    this.updateSection(index, { open: willBeOpen });

    // Handle animation
    if (this.animation !== CollapseAnimation.None) {
      await this.animationController.animateToggle(index, willBeOpen);
    }

    // Dispatch toggle event
    this.dispatchEvent(new CustomEvent<CollapseSectionToggleEvent>('section-toggle', {
      detail: {
        index,
        section: this.sections[index],
        isOpen: willBeOpen
      },
      bubbles: true
    }));
  }

  /**
   * Open a specific section
   */
  async openSection(index: number): Promise<void> {
    const section = this.sections[index];
    if (section && !section.open) {
      await this.toggleSection(index);
    }
  }

  /**
   * Close a specific section
   */
  async closeSection(index: number): Promise<void> {
    const section = this.sections[index];
    if (section && section.open) {
      await this.toggleSection(index);
    }
  }

  /**
   * Open all sections (respects accordion mode)
   */
  openAllSections(): void {
    this.accordionController.openAllSections();
  }

  /**
   * Close all sections
   */
  closeAllSections(): void {
    this.accordionController.closeAllSections();
  }

  /**
   * Update a specific section (used by controllers and internal logic)
   */
  updateSection(index: number, updates: Partial<CollapseSection>): void {
    if (index < 0 || index >= this.sections.length) {
      return;
    }
    
    this.sections = this.sections.map((section, i) => 
      i === index ? { ...section, ...updates } : section
    );
  }

  /**
   * Update multiple sections at once (used by controllers for batch operations)
   */
  updateSections(updates: Array<{ index: number; updates: Partial<CollapseSection> }>): void {
    if (updates.length === 0) {
      return;
    }
    
    this.sections = this.sections.map((section, i) => {
      const update = updates.find(u => u.index === i);
      return update ? { ...section, ...update.updates } : section;
    });
  }

  /**
   * Handle toggle request from keyboard controller
   */
  private handleToggleRequest = (event: CustomEvent): void => {
    const { index } = event.detail;
    this.toggleSection(index);
  };

  /**
   * Get icon for section state
   */
  private getSectionIcon(section: CollapseSection): string {
    if (section.expandIcon && section.collapseIcon) {
      return section.open ? section.collapseIcon : section.expandIcon;
    }
    
    if (section.headerIcon) {
      return section.headerIcon;
    }

    return section.open ? this.collapseIcon : this.expandIcon;
  }

  /**
   * Check if section is animating
   */
  private isSectionAnimating(index: number): boolean {
    return this.animationController.isAnimating(index);
  }

  override render() {
    return html`
      <div class="collapse-container ${classMap({
        [`collapse-${this.size}`]: true,
        [`collapse-${this.variant}`]: true,
        'collapse-accordion': this.accordion,
        'collapse-disabled': this.disabled
      })}">
        ${map(this.sections, (section, index) => this.renderSection(section, index))}
      </div>
    `;
  }

  /**
   * Render individual section
   */
  private renderSection(section: CollapseSection, index: number) {
    const isOpen = !!section.open;
    const isDisabled = this.disabled || section.disabled;
    const isCollapsible = section.collapsible !== false;
    const isAnimating = this.isSectionAnimating(index);

    return html`
      <div 
        class="collapse-section ${classMap({
          'collapse-section--open': isOpen,
          'collapse-section--disabled': isDisabled ?? false,
          'collapse-section--non-collapsible': !isCollapsible,
          'collapse-section--animating': isAnimating,
          [section.className || EMPTY_STRING]: !!section.className
        })}"
        data-section-index="${index}"
      >
        <!-- Section Header -->
        <div
          class="collapse-header ${classMap({
            'collapse-header--expanded': isOpen,
            'collapse-header--disabled': isDisabled ?? false,
            'collapse-header--clickable': isCollapsible && !isDisabled
          })}"
          data-section-index="${index}"
          role="button"
          tabindex="${isCollapsible && !isDisabled ? '0' : '-1'}"
          aria-expanded="${isOpen}"
          aria-controls="collapse-content-${index}"
          aria-disabled="${ifDefined(isDisabled)}"
          @click="${isCollapsible && !isDisabled ? () => this.toggleSection(index) : nothing}"
        >
          ${isCollapsible ? html`
            <nr-icon
              class="collapse-icon ${classMap({
                'collapse-icon--expanded': isOpen
              })}"
              name="${this.getSectionIcon(section)}"
              aria-hidden="true"
            ></nr-icon>
          ` : nothing}
          
          <span class="collapse-header-text">
            ${section.headerSlot ? html`<slot name="${section.headerSlot}"></slot>` : section.header}
          </span>

          ${section.headerRight || section.headerRightSlot ? html`
            <div class="collapse-header-right" @click="${(e: Event) => e.stopPropagation()}">
              ${section.headerRightSlot ? html`<slot name="${section.headerRightSlot}"></slot>` : section.headerRight}
            </div>
          ` : nothing}
        </div>

        <!-- Section Content -->
        ${isOpen ? html`
          <div
            id="collapse-content-${index}"
            class="collapse-content"
            data-section-index="${index}"
            role="region"
            aria-labelledby="collapse-header-${index}"
          >
            <div class="collapse-content-inner">
              ${section.contentSlot ? html`<slot name="${section.contentSlot}"></slot>` : section.content}
            </div>
          </div>
        ` : nothing}
      </div>
    `;
  }
}
