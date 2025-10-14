/**
 * @license
 * Copyright 2023 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import { ReactiveControllerHost } from 'lit';
import { RippleController } from '../interfaces/ripple-controller.interface.js';
import { throttle } from '@nuralyui/common/utils';

/**
 * Controller that manages ripple effects for radio interactions
 * Implements performance optimizations with debouncing and throttling
 * 
 * @example
 * ```typescript
 * const controller = new RadioRippleController(hostElement);
 * controller.addRippleEffect(clickEvent); // Throttled for performance
 * ```
 */
export class RadioRippleController implements RippleController {
  readonly host: ReactiveControllerHost;
  private _rippleEnabled: boolean = true;
  private boundClickHandler: (event: Event) => void;
  private activeRipples: Set<HTMLElement> = new Set();
  private ripplePool: HTMLElement[] = []; // Object pooling for performance

  constructor(host: ReactiveControllerHost) {
    this.host = host;
    this.boundClickHandler = this.handleClick.bind(this);
    host.addController(this);
    
    // Create throttled version of addRippleEffect for performance (60fps)
    const originalAddRippleEffect = this.addRippleEffect.bind(this);
    this.addRippleEffect = throttle(originalAddRippleEffect, 16);
  }

  hostConnected() {
    (this.host as any).addEventListener('click', this.boundClickHandler);
  }

  hostDisconnected() {
    (this.host as any).removeEventListener('click', this.boundClickHandler);
  }

  // Getters and setters
  get rippleEnabled(): boolean {
    return this._rippleEnabled;
  }

  set rippleEnabled(value: boolean) {
    this._rippleEnabled = value;
  }

  // Event handler
  private handleClick(event: Event): void {
    if (!this._rippleEnabled) return;

    const target = event.target as HTMLElement;
    
    // Handle ripple for radio inputs
    if (target && target.matches('input[type="radio"]')) {
      this.addRippleToElement(target);
    }
    
    // Handle ripple for button-style radios (if needed)
    if (target && target.matches('nr-button[role="radio"]')) {
      this.addButtonRippleEffect(target);
    }
  }

  // Public method for event-based ripple
  public addRippleEffect(event: Event): void {
    const target = event.target as HTMLElement;
    if (target) {
      this.addRippleToElement(target);
    }
  }

  // Add ripple effect to radio input element  
  public addRippleToElement(target: HTMLElement): void {
    // Remove any existing ripple animation
    target.style.animation = 'none';
    
    // Force reflow to ensure animation is cleared
    target.offsetHeight;
    
    // Add ripple animation using CSS custom properties
    const duration = getComputedStyle(target).getPropertyValue('--nuraly-radio-ripple-duration') || 
                    getComputedStyle(target).getPropertyValue('--nuraly-radio-local-ripple-duration') || 
                    '300ms';
    
    target.style.animation = `radioRipple ${duration} ease-out`;
    
    // Clean up animation after completion
    const animationDuration = this.parseDuration(duration);
    setTimeout(() => {
      target.style.animation = '';
    }, animationDuration);
  }

  // Add ripple effect to button-style radio
  private addButtonRippleEffect(target: HTMLElement): void {
    // For button-style radios, we can trigger the button's own ripple effect
    // or create a custom one
    const rippleElement = this.createRippleElement(target);
    if (rippleElement) {
      target.appendChild(rippleElement);
      
      // Remove ripple element after animation
      setTimeout(() => {
        if (rippleElement.parentNode) {
          rippleElement.parentNode.removeChild(rippleElement);
        }
      }, 600);
    }
  }

  // Create ripple element for manual ripple effects (uses object pooling)
  private createRippleElement(container: HTMLElement): HTMLElement | null {
    const ripple = this.getRippleElement(container);
    ripple.style.animation = 'radioRippleSpread 600ms ease-out';
    return ripple;
  }

  // Parse CSS duration string to milliseconds
  private parseDuration(duration: string): number {
    const match = duration.match(/^([\d.]+)(s|ms)$/);
    if (!match) return 300;
    
    const value = parseFloat(match[1]);
    const unit = match[2];
    
    return unit === 's' ? value * 1000 : value;
  }

  // Programmatic ripple trigger
  triggerRipple(optionValue?: string): void {
    if (!this._rippleEnabled) return;
    
    const host = this.host as any;
    const shadowRoot = host.shadowRoot;
    
    if (!shadowRoot) return;

    let target: HTMLElement | null = null;
    
    if (optionValue) {
      // Find specific radio input by value
      target = shadowRoot.querySelector(`input[type="radio"][value="${optionValue}"]`);
    } else {
      // Find selected radio input
      target = shadowRoot.querySelector('input[type="radio"]:checked');
    }
    
    if (target) {
      this.addRippleToElement(target);
    }
  }

  // Disable ripple effects
  disableRipple(): void {
    this._rippleEnabled = false;
  }

  // Enable ripple effects
  enableRipple(): void {
    this._rippleEnabled = true;
  }

  /**
   * Clear all active ripple effects for performance
   * Implements object pooling for memory efficiency
   */
  clearRipples(): void {
    // Clear all active ripples and return elements to pool
    this.activeRipples.forEach(ripple => {
      if (ripple.parentNode) {
        ripple.parentNode.removeChild(ripple);
      }
      // Return to pool for reuse
      if (this.ripplePool.length < 10) { // Limit pool size
        ripple.style.animation = '';
        ripple.style.transform = 'scale(0)';
        this.ripplePool.push(ripple);
      }
    });
    
    this.activeRipples.clear();
    
    // Clear any CSS animations on radio inputs
    const host = this.host as any;
    const shadowRoot = host.shadowRoot;
    if (shadowRoot) {
      const radioInputs = shadowRoot.querySelectorAll('input[type="radio"]');
      radioInputs.forEach((input: HTMLElement) => {
        input.style.animation = '';
      });
    }
  }

  /**
   * Get a ripple element from pool or create new one
   * Improves performance by reusing DOM elements
   */
  private getRippleElement(container: HTMLElement): HTMLElement {
    let ripple = this.ripplePool.pop();
    
    if (!ripple) {
      ripple = document.createElement('span');
      ripple.className = 'radio-ripple';
      ripple.style.position = 'absolute';
      ripple.style.borderRadius = '50%';
      ripple.style.background = 'currentColor';
      ripple.style.opacity = '0.1';
      ripple.style.pointerEvents = 'none';
    }
    
    // Calculate ripple size and position
    const rect = container.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    
    ripple.style.width = `${size}px`;
    ripple.style.height = `${size}px`;
    ripple.style.left = `${-size / 2}px`;
    ripple.style.top = `${-size / 2}px`;
    ripple.style.transform = 'scale(0)';
    
    this.activeRipples.add(ripple);
    return ripple;
  }

  /**
   * Add ripple effect to a specific element (interface method)
   * @param element - The element to add ripple effect to
   */
  addRippleEffectToElement(element: HTMLElement): void {
    this.addRippleToElement(element);
  }

  /**
   * Set whether ripple effects are enabled (interface method)
   * @param enabled - True to enable ripple effects
   */
  setRippleEnabled(enabled: boolean): void {
    this._rippleEnabled = enabled;
  }
}
