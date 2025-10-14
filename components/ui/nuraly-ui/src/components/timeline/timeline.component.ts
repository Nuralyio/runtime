/**
 * @license
 * Copyright 2023 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import { html, LitElement, nothing, TemplateResult } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { map } from 'lit/directives/map.js';
import { styleMap } from 'lit/directives/style-map.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { styles } from './timeline.style.js';
import { NuralyUIBaseMixin } from '@nuralyui/common/mixins';
import {
    TimelineMode,
    TimelineItem,
    TimelineItemColor,
    TimelineItemPosition
} from './timeline.types.js';
import '../icon/index.js';

/**
 * # Timeline Component
 * 
 * Vertical display timeline for showing a series of events in chronological order.
 * 
 * ## Features
 * - Multiple display modes (left, right, alternate)
 * - Custom dot colors and icons
 * - Label support for timestamps
 * - Pending state for ongoing activities
 * - Reverse order option
 * - Custom positioning in alternate mode
 * - Theme-aware styling
 * 
 * ## Usage
 * ```html
 * <!-- Basic timeline -->
 * <nr-timeline .items="${[
 *   { children: 'Create a services site', label: '2015-09-01' },
 *   { children: 'Solve initial network problems', label: '2015-09-01' },
 *   { children: 'Technical testing', label: '2015-09-01' }
 * ]}"></nr-timeline>
 * 
 * <!-- With custom colors -->
 * <nr-timeline .items="${[
 *   { children: 'Success', color: 'green' },
 *   { children: 'Error', color: 'red' },
 *   { children: 'Processing', color: 'blue' }
 * ]}"></nr-timeline>
 * 
 * <!-- Alternate mode -->
 * <nr-timeline mode="alternate" .items="${items}"></nr-timeline>
 * 
 * <!-- With pending state -->
 * <nr-timeline pending="Recording..." .items="${items}"></nr-timeline>
 * ```
 * 
 * @element nr-timeline
 * 
 * @cssproperty --nuraly-timeline-item-padding-bottom - Bottom padding of timeline item
 * @cssproperty --nuraly-timeline-tail-width - Width of connecting line
 * @cssproperty --nuraly-timeline-tail-color - Color of connecting line
 * @cssproperty --nuraly-timeline-dot-bg - Background color of dot
 * @cssproperty --nuraly-timeline-dot-border-width - Border width of dot
 */
@customElement('nr-timeline')
export class NrTimelineElement extends NuralyUIBaseMixin(LitElement) {
  static override styles = styles;

  override requiredComponents = ['nr-icon'];

  /**
   * Timeline display mode
   */
  @property({ type: String, reflect: true })
  mode: TimelineMode = TimelineMode.Left;

  /**
   * Timeline items array
   */
  @property({ type: Array })
  items: TimelineItem[] = [];

  /**
   * Pending state - shows a pending item at the end
   */
  @property({ type: String })
  pending?: string;

  /**
   * Custom pending dot icon
   */
  @property({ type: String, attribute: 'pending-dot' })
  pendingDot?: string;

  /**
   * Reverse timeline order
   */
  @property({ type: Boolean, reflect: true })
  reverse = false;

  /**
   * Get item position for alternate mode
   */
  private getItemPosition(item: TimelineItem, index: number): TimelineItemPosition {
    if (this.mode !== TimelineMode.Alternate) {
      return TimelineItemPosition.Left;
    }

    if (item.position) {
      return item.position;
    }

    return index % 2 === 0 ? TimelineItemPosition.Left : TimelineItemPosition.Right;
  }

  /**
   * Check if color is a preset color
   */
  private isPresetColor(color?: string): boolean {
    if (!color) return false;
    const presetColors = ['blue', 'red', 'green', 'gray'];
    return presetColors.includes(color);
  }

  /**
   * Get custom color style for dot
   */
  private getCustomColorStyle(color?: string): Record<string, string> {
    if (!color || this.isPresetColor(color)) {
      return {};
    }

    return {
      borderColor: color,
    };
  }

  /**
   * Render timeline item dot
   */
  private renderDot(item: TimelineItem): TemplateResult {
    const hasCustomDot = !!item.dot;
    const color = item.color || TimelineItemColor.Blue;
    const isPreset = this.isPresetColor(color);

    if (hasCustomDot) {
      return html`
        <div class="timeline-item-head-custom">
          <nr-icon name="${ifDefined(item.dot)}"></nr-icon>
        </div>
      `;
    }

    const headClasses = {
      'timeline-item-head': true,
      [color]: isPreset,
    };

    const headStyle = this.getCustomColorStyle(color);

    return html`
      <div class=${classMap(headClasses)} style=${styleMap(headStyle)}></div>
    `;
  }

  /**
   * Render timeline item
   */
  private renderItem(item: TimelineItem, index: number): TemplateResult {
    const position = this.getItemPosition(item, index);
    const itemClasses = {
      'timeline-item': true,
      'timeline-item-left': position === TimelineItemPosition.Left,
      'timeline-item-right': position === TimelineItemPosition.Right,
      [item.className || '']: !!item.className,
    };

    return html`
      <li class=${classMap(itemClasses)}>
        <div class="timeline-item-tail"></div>
        ${this.renderDot(item)}
        <div class="timeline-item-content">
          ${item.label && this.mode === TimelineMode.Alternate
            ? html`<div class="timeline-item-label">${item.label}</div>`
            : nothing}
          <div>${item.children}</div>
          ${item.label && this.mode !== TimelineMode.Alternate
            ? html`<div style="color: var(--nuraly-color-text-secondary); margin-top: 4px;">${item.label}</div>`
            : nothing}
        </div>
      </li>
    `;
  }

  /**
   * Render pending item
   */
  private renderPendingItem(): TemplateResult {
    const pendingContent = typeof this.pending === 'string' ? this.pending : 'Loading...';
    const pendingIconName = this.pendingDot || 'loading';

    return html`
      <li class="timeline-item pending">
        <div class="timeline-item-tail"></div>
        <div class="timeline-item-head-custom">
          <nr-icon name="${pendingIconName}"></nr-icon>
        </div>
        <div class="timeline-item-content">
          ${pendingContent}
        </div>
      </li>
    `;
  }

  override render() {
    if (!this.items || this.items.length === 0) {
      return nothing;
    }

    return html`
      <ul class="timeline">
        ${map(this.items, (item, index) => this.renderItem(item, index))}
        ${this.pending ? this.renderPendingItem() : nothing}
      </ul>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'nr-timeline': NrTimelineElement;
  }
}
