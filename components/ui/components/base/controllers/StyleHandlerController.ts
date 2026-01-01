/**
 * @file StyleHandlerController.ts
 * @description Controller for processing component style handlers
 * Matches original BaseElement behavior
 */

import type { ReactiveController } from "lit";
import { Subscription } from "rxjs";
import Editor from "../../../../../state/editor";
import { RuntimeHelpers } from "../../../../../utils/runtime-helpers";
import { isServer } from "../../../../../utils/envirement";
import { $runtimeStylescomponentStyleByID } from "../../../../../redux/store/component/store";
import type { StyleHandlerHost, Disposable } from "../types/base-element.types";
import { traitStyleHandler } from "../BaseElement/input-handler.helpers";

/** Pseudo-state selectors supported by the style system */
const PSEUDO_STATES = [":hover", ":focus", ":active", ":disabled"] as const;

/**
 * Controller responsible for processing style handlers
 * Matches original BaseElement.traitStylesHandlers behavior
 */
export class StyleHandlerController implements ReactiveController, Disposable {
  private host: StyleHandlerHost;
  private subscription = new Subscription();
  private runtimeStyles: Record<string, any> = {};
  private isConnected = false;

  constructor(host: StyleHandlerHost) {
    this.host = host;
    host.addController(this);
  }

  hostConnected(): void {
    this.isConnected = true;
    this.setupSubscriptions();
  }

  hostDisconnected(): void {
    this.isConnected = false;
    this.dispose();
  }

  /**
   * Set up subscriptions for runtime style updates
   * Matches original connectedCallback subscription
   */
  private setupSubscriptions(): void {
    // Subscribe to runtime styles from store
    this.subscription.add(
      $runtimeStylescomponentStyleByID(this.host.uniqueUUID).subscribe(
        (styles) => {
          this.host.runtimeStyles = styles || {};
        }
      )
    );
  }

  /**
   * Process all style handlers for the component
   * Matches original traitStylesHandlers behavior exactly
   */
  async processStyles(): Promise<void> {
    if (isServer || !this.isConnected) return;

    const { component } = this.host;

    if (component?.styleHandlers) {
      this.host.stylesHandlersValue = {};
      await Promise.all(
        Object.entries(component.styleHandlers).map(
          ([name, style]) => traitStyleHandler(this.host, style, name)
        )
      );
    }

    // Calculate styles - inline from original
    this.calculateStyles();
  }

  /**
   * Calculate and apply styles to the host element
   * Matches original calculateStyles behavior
   */
  private calculateStyles(): void {
    const { component, inputHandlersValue } = this.host;

    // Merge component styles with existing calculated styles
    this.host.calculatedStyles = {
      ...Editor.getComponentStyles(component),
      ...this.host.calculatedStyles,
    };

    // Apply alignment styles to host element
    const { innerAlignment } = inputHandlersValue;
    const hostStyle = this.host.style;

    // Reset alignment properties
    hostStyle.removeProperty("align-self");
    hostStyle.removeProperty("margin");
    hostStyle.removeProperty("margin-left");

    // Apply alignment
    if (innerAlignment === "end") {
      hostStyle.marginLeft = "auto";
    } else if (innerAlignment === "middle") {
      hostStyle.alignSelf = "center";
      hostStyle.margin = "auto";
    }

    // Apply layout styles
    const { width, flex, cursor } = this.host.calculatedStyles;

    if (width && RuntimeHelpers.extractUnit(width) === "%") {
      hostStyle.width = width;
    }
    if (flex) {
      hostStyle.flex = flex;
    }
    if (cursor) {
      hostStyle.cursor = cursor;
    }
  }

  /**
   * Get computed styles for the component
   * Matches original getStyles method
   */
  getComputedStyles(): Record<string, any> {
    const { component } = this.host;
    const width = Editor.getComponentStyle(component, "width");
    const allStyles = Editor.getComponentStyles(component);

    // Filter out pseudo-state styles (they're handled via CSS classes)
    const pseudoStates = [':hover', ':focus', ':active', ':disabled'];
    const regularStyles = Object.keys(allStyles)
      .filter(key => !pseudoStates.includes(key))
      .reduce((obj, key) => {
        obj[key] = allStyles[key];
        return obj;
      }, {} as Record<string, any>);

    return {
      ...regularStyles,
      ...this.host.stylesHandlersValue,
      width: width ?? "auto",
      ...this.host.runtimeStyles,
    };
  }

  /**
   * Generate CSS string for pseudo-state styles
   * Matches original generatePseudoStateStyles method
   */
  generatePseudoStateCSS(): string {
    const componentStyles = Editor.getComponentStyles(this.host.component);
    const pseudoStates = [':hover', ':focus', ':active', ':disabled'];
    let cssString = '';

    // Generate base class with regular styles (non-pseudo-state)
    const regularStyles = Object.keys(componentStyles)
      .filter(key => !pseudoStates.includes(key))
      .reduce((obj, key) => {
        obj[key] = componentStyles[key];
        return obj;
      }, {} as Record<string, any>);

    const baseStyleRules = Object.entries(regularStyles)
      .map(([property, value]) => `  ${property}: ${value};`)
      .join('\n');

    if (baseStyleRules) {
      cssString += `.drop-${this.host.component.uuid} {\n${baseStyleRules}\n}\n`;
    }

    // Generate pseudo-state classes
    pseudoStates.forEach(pseudoState => {
      if (componentStyles[pseudoState] && typeof componentStyles[pseudoState] === 'object') {
        const pseudoStyles = componentStyles[pseudoState];
        const styleRules = Object.entries(pseudoStyles)
          .map(([property, value]) => `  ${property}: ${value};`)
          .join('\n');

        if (styleRules) {
          cssString += `.drop-${this.host.component.uuid}${pseudoState} {\n${styleRules}\n}\n`;
        }
      }
    });

    return cssString;
  }

  /**
   * Clean up all resources
   */
  dispose(): void {
    this.subscription.unsubscribe();
    this.subscription = new Subscription();
    this.runtimeStyles = {};
  }
}
