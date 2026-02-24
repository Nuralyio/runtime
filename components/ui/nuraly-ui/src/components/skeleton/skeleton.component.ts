/**
 * @license
 * Copyright 2023 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import { html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { styleMap } from 'lit/directives/style-map.js';
import { styles } from './skeleton.style.js';
import { NuralyUIBaseMixin } from '@nuralyui/common/mixins';
import {
    SkeletonShape,
    SkeletonSize,
    SkeletonElementType,
    SkeletonAvatarConfig,
    SkeletonTitleConfig,
    SkeletonParagraphConfig,
    SkeletonButtonConfig,
    SkeletonInputConfig,
    SkeletonImageConfig,
} from './skeleton.types.js';

/**
 * # Skeleton Component
 *
 * Provides a placeholder while content is loading, or to visualize content that doesn't exist yet.
 * Improves perceived performance and user experience during data fetching.
 *
 * ## Features
 * - Multiple skeleton elements (Avatar, Title, Paragraph, Button, Input, Image)
 * - Active animation effect
 * - Customizable shapes (circle, square, round)
 * - Configurable sizes (small, default, large)
 * - Loading state management
 * - Theme-aware styling
 * - Flexible configuration options
 *
 * ## Usage
 * ```html
 * <!-- Basic skeleton -->
 * <nr-skeleton></nr-skeleton>
 *
 * <!-- With active animation -->
 * <nr-skeleton active></nr-skeleton>
 *
 * <!-- Complex skeleton with avatar -->
 * <nr-skeleton avatar active></nr-skeleton>
 *
 * <!-- Loading state with content -->
 * <nr-skeleton loading>
 *   <div slot="content">
 *     <h3>Article Title</h3>
 *     <p>Article content goes here...</p>
 *   </div>
 * </nr-skeleton>
 *
 * <!-- Skeleton button -->
 * <nr-skeleton element="button" active></nr-skeleton>
 *
 * <!-- Skeleton input -->
 * <nr-skeleton element="input" block></nr-skeleton>
 * ```
 *
 * @element nr-skeleton
 *
 * @slot content - Content to show when loading is false
 *
 * @cssproperty --nuraly-skeleton-background - Background color of skeleton elements
 * @cssproperty --nuraly-skeleton-gradient-from - Start color of active animation gradient
 * @cssproperty --nuraly-skeleton-gradient-to - End color of active animation gradient
 * @cssproperty --nuraly-skeleton-icon-color - Color of image placeholder icon
 */
@customElement('nr-skeleton')
export class NrSkeletonElement extends NuralyUIBaseMixin(LitElement) {
  static override styles = styles;

  /**
   * Show animation effect
   */
  @property({ type: Boolean }) active = false;

  /**
   * Show avatar placeholder
   */
  @property({ type: Boolean }) avatar = false;

  /**
   * Avatar configuration
   */
  @property({ type: Object, attribute: 'avatar-config' }) avatarConfig: SkeletonAvatarConfig = {};

  /**
   * Display the skeleton when true
   */
  @property({ type: Boolean }) loading = true;

  /**
   * Show paragraph placeholder
   */
  @property({ type: Boolean }) paragraph = true;

  /**
   * Paragraph configuration
   */
  @property({ type: Object, attribute: 'paragraph-config' }) paragraphConfig: SkeletonParagraphConfig = {};

  /**
   * Show paragraph and title radius when true
   */
  @property({ type: Boolean }) round = false;

  /**
   * Show title placeholder
   */
  @property({ type: Boolean, attribute: 'show-title' }) showTitle = true;

  /**
   * Title configuration
   */
  @property({ type: Object, attribute: 'title-config' }) titleConfig: SkeletonTitleConfig = {};

  /**
   * Element type for standalone skeleton elements
   */
  @property({ type: String }) element?: SkeletonElementType;

  /**
   * Button configuration
   */
  @property({ type: Object, attribute: 'button-config' }) buttonConfig: SkeletonButtonConfig = {};

  /**
   * Input configuration
   */
  @property({ type: Object, attribute: 'input-config' }) inputConfig: SkeletonInputConfig = {};

  /**
   * Image configuration
   */
  @property({ type: Object, attribute: 'image-config' }) imageConfig: SkeletonImageConfig = {};

  /**
   * Block style for button/input
   */
  @property({ type: Boolean }) block = false;

  /**
   * Shape for standalone elements
   */
  @property({ type: String }) shape: SkeletonShape = SkeletonShape.Default;

  /**
   * Size for standalone elements
   */
  @property({ type: String }) size: SkeletonSize = SkeletonSize.Default;

  /**
   * Render avatar skeleton
   */
  private renderAvatar() {
    const config = typeof this.avatar === 'object' ? this.avatar : this.avatarConfig;
    const shape = config.shape || SkeletonShape.Circle;
    const size = config.size || SkeletonSize.Default;
    
    const sizeClass = typeof size === 'number' ? '' : size;
    const customSize = typeof size === 'number' ? { width: `${size}px`, height: `${size}px` } : {};

    return html`
      <div
        class=${classMap({
          'skeleton-avatar': true,
          [`skeleton-avatar--${shape}`]: true,
          [`skeleton-avatar--${sizeClass}`]: !!sizeClass,
        })}
        style=${styleMap(customSize)}></div>
    `;
  }

  /**
   * Render title skeleton
   */
  private renderTitle() {
    const config = typeof this.showTitle === 'object' ? this.showTitle as any : this.titleConfig;
    const width = config.width;
    const customWidth = width ? { width: typeof width === 'number' ? `${width}px` : width } : { width: '38%' };

    return html`
      <div
        class=${classMap({
          'skeleton-title': true,
          'skeleton-title--round': this.round,
        })}
        style=${styleMap(customWidth)}></div>
    `;
  }

  /**
   * Render paragraph skeleton
   */
  private renderParagraph() {
    const config = typeof this.paragraph === 'object' ? this.paragraph : this.paragraphConfig;
    const rows = config.rows || 3;
    const widthConfig = config.width;

    const getLineWidth = (index: number): Record<string, string> => {
      if (Array.isArray(widthConfig)) {
        const width = widthConfig[index];
        return width ? { width: typeof width === 'number' ? `${width}px` : width } : {};
      }
      
      // Last line uses custom width or 61%
      if (index === rows - 1) {
        if (widthConfig) {
          return { width: typeof widthConfig === 'number' ? `${widthConfig}px` : widthConfig };
        }
        return { width: '61%' };
      }
      
      return {};
    };

    return html`
      <div class="skeleton-paragraph">
        ${Array.from({ length: rows }, (_, i) => html`
          <div
            class=${classMap({
              'skeleton-paragraph-line': true,
              'skeleton-paragraph-line--round': this.round,
            })}
            style=${styleMap(getLineWidth(i))}></div>
        `)}
      </div>
    `;
  }

  /**
   * Render button skeleton
   */
  private renderButton() {
    const config = this.buttonConfig;
    const buttonShape = config.shape || this.shape;
    const buttonSize = config.size || this.size;
    const buttonBlock = config.block !== undefined ? config.block : this.block;

    return html`
      <div
        class=${classMap({
          'skeleton-button': true,
          [`skeleton-button--${buttonShape}`]: true,
          [`skeleton-button--${buttonSize}`]: true,
          'skeleton-button--block': buttonBlock,
        })}></div>
    `;
  }

  /**
   * Render input skeleton
   */
  private renderInput() {
    const config = this.inputConfig;
    const inputSize = config.size || this.size;
    const inputBlock = config.block !== undefined ? config.block : this.block;

    return html`
      <div
        class=${classMap({
          'skeleton-input': true,
          [`skeleton-input--${inputSize}`]: true,
          'skeleton-input--block': inputBlock,
        })}></div>
    `;
  }

  /**
   * Render image skeleton
   */
  private renderImage() {
    return html`
      <div class="skeleton-image">
        <svg
          class="skeleton-image-icon"
          viewBox="0 0 1024 1024"
          xmlns="http://www.w3.org/2000/svg"
          width="48"
          height="48">
          <path
            d="M928 160H96c-17.7 0-32 14.3-32 32v640c0 17.7 14.3 32 32 32h832c17.7 0 32-14.3 32-32V192c0-17.7-14.3-32-32-32zM338 304c35.3 0 64 28.7 64 64s-28.7 64-64 64-64-28.7-64-64 28.7-64 64-64zm513.9 437.1c-2.1 2.1-4.5 3.8-7 5.1-5.2 2.7-11.1 4.1-17.1 4.1H196.2c-6 0-11.9-1.4-17.1-4.1-2.5-1.3-4.9-3-7-5.1-4.4-4.4-7.1-10.5-7.1-17.1 0-3.7.8-7.4 2.5-10.8 1.6-3.4 4.1-6.4 7.1-8.8l112.3-97.5c8.8-7.6 22.1-7.6 30.9 0l148.5 129 203.9-177c8.8-7.6 22.1-7.6 30.9 0l179.8 156.1c3 2.6 5.5 5.7 7.1 9.3 1.7 3.7 2.5 7.6 2.5 11.6-.1 6.6-2.8 12.7-7.2 17.1z"
            fill="currentColor" />
        </svg>
      </div>
    `;
  }

  /**
   * Render standalone element
   */
  private renderStandaloneElement() {
    switch (this.element) {
      case SkeletonElementType.Button:
        return this.renderButton();
      case SkeletonElementType.Input:
        return this.renderInput();
      case SkeletonElementType.Image:
        return this.renderImage();
      case SkeletonElementType.Avatar:
        return this.renderAvatar();
      default:
        return html``;
    }
  }

  /**
   * Render full skeleton
   */
  private renderSkeleton() {
    // If element type is specified, render standalone element
    if (this.element) {
      return html`
        <div
          class=${classMap({
            'skeleton': true,
            'skeleton--active': this.active || (this.element === SkeletonElementType.Avatar && !!this.avatarConfig.active),
          })}>
          ${this.renderStandaloneElement()}
        </div>
      `;
    }

    // Render full skeleton layout
    return html`
      <div
        class=${classMap({
          'skeleton': true,
          'skeleton--active': this.active,
        })}>
        ${this.avatar || this.showTitle || this.paragraph
          ? html`
              ${this.avatar
                ? html`
                    <div class="skeleton-header">
                      ${this.renderAvatar()}
                      ${this.showTitle || this.paragraph
                        ? html`
                            <div class="skeleton-content">
                              ${this.showTitle ? this.renderTitle() : ''}
                              ${this.paragraph ? this.renderParagraph() : ''}
                            </div>
                          `
                        : ''}
                    </div>
                  `
                : html`
                    <div class="skeleton-content">
                      ${this.showTitle ? this.renderTitle() : ''}
                      ${this.paragraph ? this.renderParagraph() : ''}
                    </div>
                  `}
            `
          : ''}
      </div>
    `;
  }

  override render() {
    // If loading is false, show slotted content
    if (!this.loading) {
      return html`
        <div class="skeleton-wrapper">
          <slot name="content"><slot></slot></slot>
        </div>
      `;
    }

    // Show skeleton
    return this.renderSkeleton();
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'nr-skeleton': NrSkeletonElement;
  }
}
