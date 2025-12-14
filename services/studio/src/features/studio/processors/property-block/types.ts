/**
 * Type definitions for Property Block Processor
 */

export interface PropertyConfig {
  name: string;
  label: string;
  type: 'number' | 'select' | 'text' | 'color' | 'boolean' | 'radio' | 'event' | 'icon' | 'date';
  default: any;
  unit?: string;
  min?: number;
  max?: number;
  step?: number;
  width?: string;
  placeholder?: string;
  format?: string;  // Date format for date inputs
  options?: Array<{ value: string; label: string }>;
  autoCheckbox?: boolean;
  // Input property mapping
  inputProperty?: string;  // The actual component input property name (if different from 'name')
  // Generic handlers - can be inline code, handler reference, or simple value
  valueHandler?: string | { ref: string; params?: any[] };
  stateHandler?: string | { ref: string; params?: any[] };
  helperHandler?: string | { ref: string; params?: any[] };  // Custom helper text handler
  eventHandlers?: {
    [eventName: string]: string | { ref: string; params?: any[] };
  };
  // Handler support (code icon)
  hasHandler?: boolean;  // Whether this property supports handlers
  handlerType?: 'style' | 'input';  // Type of handler (styleHandlers or inputHandlers)
  handlerProperty?: string;  // The property name in the handlers object
  handlerValueGetter?: string | { ref: string; params?: any[] };  // Code to get handler value
  handlerEventUpdate?: string | { ref: string; params?: any[] };  // Code to update handler
}

export interface BlockConfig {
  container: {
    uuid: string;
    name: string;
    style: Record<string, string>;
  };
  collapse: {
    uuid: string;
    title: string;
    style: Record<string, string>;
  };
  properties: PropertyConfig[];
  includeCommonProperties?: string[];  // Array of common property block UUIDs to include
}

export interface GenericConfig {
  [blockName: string]: BlockConfig;
}

export interface SizeConfig {
  sizeInputs: BlockConfig;
}
