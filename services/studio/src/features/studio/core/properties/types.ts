/**
 * @fileoverview Property Definition Types
 * @module Studio/Core/Properties/Types
 *
 * @description
 * Type definitions for the TypeScript-based property system that replaces
 * JSON configuration files.
 */

import type {
  ValueHandler,
  StateHandler,
  BooleanStateHandler,
  EventHandler,
  RadioOption,
  SelectOption,
} from '../handlers/types';

/**
 * Property input types supported by the property system.
 */
export type PropertyType =
  | 'text'
  | 'textarea'
  | 'number'
  | 'boolean'
  | 'radio'
  | 'select'
  | 'color'
  | 'icon'
  | 'event'
  | 'date';

/**
 * Handler type for code icon functionality.
 */
export type HandlerSourceType = 'input' | 'style';

/**
 * Complete property definition with typed handlers.
 *
 * @description
 * This interface replaces the JSON PropertyConfig with a fully typed
 * TypeScript structure. All handlers are class instances instead of
 * string references.
 */
export interface PropertyDefinition<T = unknown> {
  /** Unique property identifier */
  name: string;

  /** Display label in the property panel */
  label: string;

  /** Input type determining the UI control */
  type: PropertyType;

  /** Component input property name (if different from name) */
  inputProperty?: string;

  /** Default value */
  default?: T;

  /** Input width (e.g., "180px") */
  width?: string;

  /** Placeholder text for text inputs */
  placeholder?: string;

  /** Helper text displayed below input */
  helperText?: string;

  /** Options for radio/select inputs */
  options?: SelectOption[] | RadioOption[];

  /** CSS unit for number inputs (e.g., "px", "rem", "%") */
  unit?: string;

  /** Minimum value for number inputs */
  min?: number;

  /** Maximum value for number inputs */
  max?: number;

  /** Step value for number inputs */
  step?: number;

  /** Date format for date inputs */
  format?: string;

  /** Whether property supports code handlers (code icon) */
  hasHandler?: boolean;

  /** Handler source type (input or style) */
  handlerType?: HandlerSourceType;

  /** Property name in handlers object */
  handlerProperty?: string;

  /** Whether property supports i18n translations */
  translatable?: boolean;

  /** Show auto checkbox for optional values */
  autoCheckbox?: boolean;

  // === Typed Handlers ===

  /** Handler to retrieve current value for display */
  valueHandler: ValueHandler<T>;

  /** Handler to determine enabled/disabled state */
  stateHandler?: StateHandler | BooleanStateHandler;

  /** Handler to get helper text dynamically */
  helperHandler?: ValueHandler<string>;

  /** Event handlers map (event name -> handler) */
  eventHandlers: Record<string, EventHandler>;

  /** Handler to get code editor value (for code icon) */
  handlerValueGetter?: ValueHandler<[string, string]>;

  /** Handler to update code editor value (for code icon) */
  handlerEventUpdate?: EventHandler;
}

/**
 * Component definition containing all properties and metadata.
 */
export interface ComponentDefinition {
  /** Component type identifier (e.g., "text_input") */
  type: string;

  /** Display name */
  name: string;

  /** Component category */
  category: 'inputs' | 'layout' | 'data' | 'media' | 'display' | 'content' | 'navigation' | 'advanced';

  /** Property panel configuration */
  panel: {
    /** Container UUID */
    containerUuid: string;
    /** Container name */
    containerName: string;
    /** Collapse section UUID */
    collapseUuid: string;
    /** Collapse section title */
    collapseTitle: string;
  };

  /** Property definitions */
  properties: PropertyDefinition[];

  /** Event names this component supports */
  events?: string[];

  /** Theme CSS variables */
  themeVariables?: string[];

  /** Common property blocks to include */
  includeCommonProperties?: string[];
}

/**
 * Property group for organizing related properties.
 */
export interface PropertyGroup {
  /** Group identifier */
  id: string;

  /** Group display title */
  title: string;

  /** Properties in this group */
  properties: PropertyDefinition[];

  /** Whether group is initially collapsed */
  collapsed?: boolean;
}
