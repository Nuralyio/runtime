/**
 * @file base-element.types.ts
 * @description Type definitions for the BaseElement component system
 */

import type { ReactiveControllerHost } from "lit";
import type { Ref } from "lit/directives/ref.js";
import type { ComponentElement } from "../../../../../redux/store/component/component.interface";

/**
 * Base host interface for all controllers
 */
export interface BaseElementHost extends ReactiveControllerHost {
  component: ComponentElement;
  item: any;
  parentcomponent: ComponentElement;
  isViewMode: boolean;
  uniqueUUID: string;
  inputRef: Ref<HTMLElement>;
  style: CSSStyleDeclaration;

  // State
  resolvedInputs: Record<string, any>;
  stylesHandlersValue: Record<string, any>;
  calculatedStyles: Record<string, any>;
  errors: Record<string, any>;

  // Callbacks registry
  callbacks: Record<string, (val: any) => void>;

  // Methods
  requestUpdate(): void;
  dispatchEvent(event: Event): boolean;
  addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void;
  removeEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions): void;
  classList: DOMTokenList;
  shadowRoot: ShadowRoot | null;

  // DOM Element methods
  closest?(selector: string): Element | null;
}

/**
 * Host interface for input handler controller
 */
export interface InputHandlerHost extends BaseElementHost {
  ExecuteInstance: any;
}

/**
 * Host interface for style handler controller
 */
export interface StyleHandlerHost extends BaseElementHost {
  runtimeStyles: Record<string, any>;
}

/**
 * Host interface for event controller
 */
export interface EventHandlerHost extends BaseElementHost {}

/**
 * Host interface for selection controller
 */
export interface SelectionHost extends BaseElementHost {
  currentSelection: string[];
}

/**
 * Host interface for drag-drop controller
 */
export interface DragDropHost extends BaseElementHost {
  isDragInitiator: boolean;
  closestGenericComponentWrapper: HTMLElement | null;
}

/**
 * Host interface for error controller
 */
export interface ErrorHost extends BaseElementHost {
  displayErrorPanel: boolean;
}

/**
 * Configuration for input handler processing
 */
export interface InputHandlerConfig {
  name: string;
  input: any;
  component: ComponentElement;
  item: any;
  uniqueUUID: string;
}

/**
 * Result of input handler execution
 */
export interface InputHandlerResult {
  name: string;
  value: any;
  error?: { message: string };
}

/**
 * Configuration for style handler processing
 */
export interface StyleHandlerConfig {
  name: string;
  style: string;
  component: ComponentElement;
}

/**
 * Event execution options
 */
export interface EventExecutionOptions {
  eventName: string;
  event?: Event;
  data?: Record<string, any>;
}

/**
 * Drag wrapper position
 */
export type DragWrapperPosition = "before" | "after" | "inside";

/**
 * Controller disposal interface
 */
export interface Disposable {
  dispose(): void;
}

/**
 * Controller activation interface (for editor-only controllers)
 */
export interface Activatable {
  activate(): void;
  deactivate(): void;
}
