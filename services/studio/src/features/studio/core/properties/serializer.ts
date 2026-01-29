/**
 * @fileoverview Property Definition Serializer
 * @module Studio/Core/Properties/Serializer
 *
 * @description
 * Converts TypeScript PropertyDefinition objects to the JSON-based PropertyConfig
 * format expected by the existing block generator. This allows us to use type-safe
 * TypeScript definitions as the source of truth while maintaining compatibility
 * with the existing block generation infrastructure.
 */

import type { PropertyDefinition, ComponentDefinition } from './types';
import type { ValueHandler, StateHandler, EventHandler, BooleanStateHandler } from '../handlers/types';
import type { BlockConfig, PropertyConfig } from '../../processors/property-block/types';

/**
 * Serialize a ValueHandler to its JSON representation
 */
function serializeValueHandler(handler: ValueHandler<unknown> | undefined): string | { ref: string; params: any[] } | undefined {
  if (!handler) return undefined;

  // Check if handler has a serialize method
  if ('serialize' in handler && typeof handler.serialize === 'function') {
    return handler.serialize();
  }

  // Check for common handler patterns using handlerType
  const handlerType = handler.handlerType;

  // Handle ComponentInputHandler and similar ref-based handlers
  if ('ref' in handler) {
    return handler as { ref: string; params: any[] };
  }

  // Handle handlers with generate() method - these are inline code handlers
  if ('generate' in handler && typeof handler.generate === 'function') {
    return handler.generate(null as any);
  }

  return undefined;
}

/**
 * Serialize a StateHandler to its JSON representation
 */
function serializeStateHandler(handler: StateHandler | BooleanStateHandler | undefined): string | { ref: string; params: any[] } | undefined {
  if (!handler) return undefined;

  // Check if handler has a serialize method
  if ('serialize' in handler && typeof handler.serialize === 'function') {
    return handler.serialize();
  }

  // Check for ref-based handlers
  if ('ref' in handler) {
    return handler as { ref: string; params: any[] };
  }

  return undefined;
}

/**
 * Serialize an EventHandler to its JSON representation
 */
function serializeEventHandler(handler: EventHandler): string | { ref: string; params: any[] } {
  // Check if handler has a serialize method
  if ('serialize' in handler && typeof handler.serialize === 'function') {
    return handler.serialize();
  }

  // Check for ref-based handlers
  if ('ref' in handler) {
    return handler as { ref: string; params: any[] };
  }

  // Handle handlers with generate() method
  if ('generate' in handler && typeof handler.generate === 'function') {
    return handler.generate(null as any);
  }

  return '';
}

/**
 * Convert a PropertyDefinition to PropertyConfig format
 */
export function serializePropertyDefinition(prop: PropertyDefinition): PropertyConfig {
  const config: PropertyConfig = {
    name: prop.name,
    label: prop.label,
    type: prop.type,
    default: prop.default,
  };

  // Optional fields
  if (prop.inputProperty) config.inputProperty = prop.inputProperty;
  if (prop.width) config.width = prop.width;
  if (prop.placeholder) config.placeholder = prop.placeholder;
  if (prop.helperText) config.helperText = prop.helperText;
  if (prop.options) config.options = prop.options as Array<{ value: string; label: string }>;
  if (prop.unit) config.unit = prop.unit;
  if (prop.min !== undefined) config.min = prop.min;
  if (prop.max !== undefined) config.max = prop.max;
  if (prop.step !== undefined) config.step = prop.step;
  if (prop.format) config.format = prop.format;
  if (prop.hasHandler !== undefined) config.hasHandler = prop.hasHandler;
  if (prop.handlerType) config.handlerType = prop.handlerType;
  if (prop.handlerProperty) config.handlerProperty = prop.handlerProperty;
  if (prop.translatable !== undefined) config.translatable = prop.translatable;
  if (prop.autoCheckbox !== undefined) config.autoCheckbox = prop.autoCheckbox;

  // Serialize handlers
  const valueHandler = serializeValueHandler(prop.valueHandler);
  if (valueHandler) config.valueHandler = valueHandler;

  const stateHandler = serializeStateHandler(prop.stateHandler);
  if (stateHandler) config.stateHandler = stateHandler;

  if (prop.helperHandler) {
    const helperHandler = serializeValueHandler(prop.helperHandler);
    if (helperHandler) config.helperHandler = helperHandler;
  }

  // Serialize event handlers
  if (prop.eventHandlers && Object.keys(prop.eventHandlers).length > 0) {
    config.eventHandlers = {};
    for (const [eventName, handler] of Object.entries(prop.eventHandlers)) {
      config.eventHandlers[eventName] = serializeEventHandler(handler);
    }
  }

  // Serialize handler code support
  if (prop.handlerValueGetter) {
    const getter = serializeValueHandler(prop.handlerValueGetter);
    if (getter) config.handlerValueGetter = getter;
  }

  if (prop.handlerEventUpdate) {
    const updater = serializeEventHandler(prop.handlerEventUpdate);
    if (updater) config.handlerEventUpdate = updater;
  }

  return config;
}

/**
 * Convert a ComponentDefinition to BlockConfig format
 */
export function serializeComponentDefinition(definition: ComponentDefinition): BlockConfig {
  return {
    container: {
      uuid: definition.panel.containerUuid,
      name: definition.panel.containerName,
      style: {},
    },
    collapse: {
      uuid: definition.panel.collapseUuid,
      title: definition.panel.collapseTitle,
      style: {},
    },
    properties: definition.properties.map(serializePropertyDefinition),
    includeCommonProperties: definition.includeCommonProperties,
  };
}

/**
 * Get the config key name for a component type
 * Converts component type to the configKey format used in JSON configs
 */
export function getConfigKey(componentType: string): string {
  // Convert snake_case or kebab-case to camelCase
  const camelCase = componentType
    .replace(/[-_](.)/g, (_, char) => char.toUpperCase())
    .replace(/^(.)/, (_, char) => char.toLowerCase());

  return `${camelCase}Fields`;
}

/**
 * Create a full config object matching the original JSON structure
 */
export function createFullConfig(definition: ComponentDefinition): Record<string, BlockConfig> {
  const configKey = getConfigKey(definition.type);
  return {
    [configKey]: serializeComponentDefinition(definition),
  };
}

/**
 * Create metadata object from ComponentDefinition
 * This matches the meta.json format
 */
export function createMetadata(definition: ComponentDefinition): {
  uuid: string;
  name: string;
  themeContainerId: string;
  configKey: string;
  children_ids: string[];
} {
  const configKey = getConfigKey(definition.type);
  const baseId = definition.panel.containerUuid.replace('_collapse_container', '');

  return {
    uuid: `${baseId}_blocks`,
    name: `Parent ${definition.name} Container`,
    themeContainerId: `${baseId}_theme_container`,
    configKey,
    children_ids: [definition.panel.containerUuid],
  };
}

export default {
  serializePropertyDefinition,
  serializeComponentDefinition,
  getConfigKey,
  createFullConfig,
  createMetadata,
};
