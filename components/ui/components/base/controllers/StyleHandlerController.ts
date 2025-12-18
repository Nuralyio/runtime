/**
 * @file StyleHandlerController.ts
 * @description Controller for processing component style handlers
 * Handles dynamic style resolution, CSS generation, and caching
 */

import type { ReactiveController } from "lit";
import { Subscription } from "rxjs";
import { executeHandler } from "../../../../../handlers/handler-executor";
import Editor from "../../../../../state/editor";
import { RuntimeHelpers } from "../../../../../utils/runtime-helpers";
import { isServer } from "../../../../../utils/envirement";
import { $runtimeStylescomponentStyleByID } from "../../../../../redux/store/component/store";
import type { StyleHandlerHost, Disposable } from "../types/base-element.types";
import { StyleCache, generateStyleCacheKey } from "../utils/style-cache";

/** Pseudo-state selectors supported by the style system */
const PSEUDO_STATES = [":hover", ":focus", ":active", ":disabled"] as const;
type PseudoState = (typeof PSEUDO_STATES)[number];

/**
 * Controller responsible for processing style handlers
 * Extracts style processing logic from BaseElement for better separation of concerns
 */
export class StyleHandlerController implements ReactiveController, Disposable {
  private host: StyleHandlerHost;
  private subscription = new Subscription();
  private runtimeStyles: Record<string, any> = {};
  private pseudoStyleCache = new StyleCache(100);
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
   */
  private setupSubscriptions(): void {
    // Subscribe to runtime styles from store
    this.subscription.add(
      $runtimeStylescomponentStyleByID(this.host.uniqueUUID).subscribe(
        (styles) => {
          this.runtimeStyles = styles || {};
          this.host.requestUpdate();
        }
      )
    );
  }

  /**
   * Process all style handlers for the component
   */
  async processStyles(): Promise<void> {
    if (isServer || !this.isConnected) return;

    const { component } = this.host;
    if (!component?.styleHandlers) {
      this.calculateStyles();
      return;
    }

    // Reset style handler values
    this.host.stylesHandlersValue = {};

    // Process all style handlers in parallel
    await Promise.all(
      Object.entries(component.styleHandlers).map(([name, style]) =>
        this.processStyleHandler(style as string, name)
      )
    );

    this.calculateStyles();
    this.host.requestUpdate();
  }

  /**
   * Process a single style handler
   */
  private async processStyleHandler(
    style: string,
    styleName: string
  ): Promise<void> {
    if (!style) return;

    try {
      // Execute handler if it's a dynamic expression
      const value = style.startsWith("return ")
        ? executeHandler(this.host.component, style)
        : style;

      if (value && this.host.stylesHandlersValue[styleName] !== value) {
        this.host.stylesHandlersValue[styleName] = value;
      }
    } catch (error) {
      console.error(`Error processing style handler "${styleName}":`, error);
    }
  }

  /**
   * Calculate and apply styles to the host element
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
   * Merges multiple style sources: editor styles, handler values, runtime styles
   */
  getComputedStyles(): Record<string, any> {
    const { component } = this.host;
    const width = Editor.getComponentStyle(component, "width");
    const allStyles = Editor.getComponentStyles(component);

    // Filter out pseudo-state styles (they're handled via CSS classes)
    const regularStyles = this.filterPseudoStates(allStyles);

    // Compute final width value
    const computedWidth =
      width === "auto"
        ? "auto"
        : RuntimeHelpers.extractUnit(width) === "%"
        ? "100%"
        : width ?? "auto";

    return {
      ...regularStyles,
      ...this.host.stylesHandlersValue,
      width: computedWidth,
      ...this.runtimeStyles,
    };
  }

  /**
   * Filter out pseudo-state keys from styles object
   */
  private filterPseudoStates(
    styles: Record<string, any>
  ): Record<string, any> {
    return Object.keys(styles)
      .filter((key) => !PSEUDO_STATES.includes(key as PseudoState))
      .reduce((obj, key) => {
        obj[key] = styles[key];
        return obj;
      }, {} as Record<string, any>);
  }

  /**
   * Generate CSS string for pseudo-state styles
   * Uses caching to avoid regeneration on every render
   */
  generatePseudoStateCSS(): string {
    const componentStyles = Editor.getComponentStyles(this.host.component);
    const cacheKey = generateStyleCacheKey(
      this.host.component.uuid,
      componentStyles
    );

    return this.pseudoStyleCache.getOrGenerate(cacheKey, () =>
      this.buildPseudoStateCSS(componentStyles)
    );
  }

  /**
   * Build CSS string for pseudo-state styles
   */
  private buildPseudoStateCSS(componentStyles: Record<string, any>): string {
    const uuid = this.host.component.uuid;
    let cssString = "";

    // Generate base class with regular styles
    const regularStyles = this.filterPseudoStates(componentStyles);
    const baseRules = this.stylesToCSS(regularStyles);

    if (baseRules) {
      cssString += `.drop-${uuid} {\n${baseRules}}\n`;
    }

    // Generate pseudo-state classes
    for (const pseudoState of PSEUDO_STATES) {
      const stateStyles = componentStyles[pseudoState];
      if (stateStyles && typeof stateStyles === "object") {
        const stateRules = this.stylesToCSS(stateStyles);
        if (stateRules) {
          cssString += `.drop-${uuid}${pseudoState} {\n${stateRules}}\n`;
        }
      }
    }

    return cssString;
  }

  /**
   * Convert styles object to CSS rule string
   */
  private stylesToCSS(styles: Record<string, any>): string {
    return Object.entries(styles)
      .filter(([_, value]) => value !== undefined && value !== null)
      .map(([property, value]) => `  ${property}: ${value};`)
      .join("\n");
  }

  /**
   * Check if component has any pseudo-state styles
   */
  hasPseudoStateStyles(): boolean {
    const componentStyles = Editor.getComponentStyles(this.host.component);
    return PSEUDO_STATES.some(
      (state) =>
        componentStyles[state] &&
        typeof componentStyles[state] === "object" &&
        Object.keys(componentStyles[state]).length > 0
    );
  }

  /**
   * Invalidate cached styles for this component
   */
  invalidateCache(): void {
    // Clear entries for this component
    const componentStyles = Editor.getComponentStyles(this.host.component);
    const cacheKey = generateStyleCacheKey(
      this.host.component.uuid,
      componentStyles
    );
    this.pseudoStyleCache.delete(cacheKey);
  }

  /**
   * Clean up all resources
   */
  dispose(): void {
    this.subscription.unsubscribe();
    this.subscription = new Subscription();
    this.pseudoStyleCache.clear();
    this.runtimeStyles = {};
  }
}
