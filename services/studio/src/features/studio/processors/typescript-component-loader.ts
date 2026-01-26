/**
 * TypeScript Component Loader
 *
 * Generates studio component properties from TypeScript definitions.
 * This loader replaces the JSON-based component-loader.ts for components
 * that have been migrated to TypeScript properties.
 *
 * Usage:
 * ```typescript
 * import { textInputDefinition, textInputProperties } from './text-input/properties';
 * import handlersConfig from './text-input/handlers.json';
 * import themeConfig from './text-input/theme.json';
 *
 * export const StudioTextInput = loadFromTypeScript(
 *   textInputDefinition,
 *   handlersConfig,
 *   themeConfig
 * );
 * ```
 */

import { COMMON_ATTRIBUTES } from "../core/helpers/common_attributes.ts";
import { generateFromConfig, type BlockConfig } from "./property-block/index.ts";
import { createHandlersFromEvents } from "../core/utils/handler-generator.ts";
import { generateComponents } from "../blocks/common-blocks/studio-theme-block.ts";
import type { ComponentDefinition } from "../core/properties/types";
import { serializeComponentDefinition, getConfigKey } from "../core/properties/serializer";

// Memoization cache to prevent re-processing
const componentCache = new Map<string, any[]>();

// Clear cache in development for hot reload
if (import.meta.hot) {
  import.meta.hot.accept(() => {
    componentCache.clear();
  });
}

type HandlerConfig = {
  handlerPrefix: string;
  events: Array<{ name: string; label: string }>;
};

/**
 * Load component from TypeScript definition
 *
 * @param definition - ComponentDefinition from properties.ts
 * @param handlersConfig - Event handlers configuration JSON
 * @param themeConfig - Theme/CSS variables configuration JSON
 * @param children_ids - Optional custom children_ids array
 */
export function loadFromTypeScript(
  definition: ComponentDefinition,
  handlersConfig: any,
  themeConfig: any,
  children_ids?: string[]
) {
  // Check cache first using panel container as unique identifier
  const cacheKey = definition.panel.containerUuid;
  if (componentCache.has(cacheKey)) {
    return componentCache.get(cacheKey)!;
  }

  // Serialize TypeScript definition to BlockConfig format
  const blockConfig: BlockConfig = serializeComponentDefinition(definition);
  const configKey = getConfigKey(definition.type);

  // Generate field components from serialized config
  const fieldComponents = generateFromConfig(blockConfig, configKey);

  // Generate handlers from JSON config (handlers.json still used for now)
  const handlersConfigTyped = handlersConfig as HandlerConfig;
  const handlerComponents = createHandlersFromEvents(
    handlersConfigTyped.events,
    handlersConfigTyped.handlerPrefix
  );

  // Generate theme components from JSON config
  const themeModes = Array.isArray(themeConfig)
    ? themeConfig
    : themeConfig.theme?.modes;

  const themeContainerId = `${definition.panel.containerUuid.replace('_collapse_container', '')}_theme_container`;
  const themeComponents =
    themeModes && themeModes.length > 0
      ? generateComponents(themeModes, themeContainerId)
      : [];

  // Determine parent UUID and children
  const baseId = definition.panel.containerUuid.replace('_collapse_container', '');
  const parentUuid = `${baseId}_blocks`;
  const defaultChildrenIds = [definition.panel.containerUuid];

  // Build parent container
  const parentContainer = {
    uuid: parentUuid,
    application_id: "1",
    name: `Parent ${definition.name} Container`,
    type: "container",
    ...COMMON_ATTRIBUTES,
    style: {
      display: "flex",
      "flex-direction": "column",
    },
    children_ids: children_ids || defaultChildrenIds,
  };

  // Combine all components
  const result = [
    parentContainer,
    ...fieldComponents,
    ...handlerComponents,
    ...themeComponents,
  ];

  // Cache the result
  componentCache.set(cacheKey, result);

  return result;
}

/**
 * Load component using only TypeScript definition (no handlers/theme JSON)
 * For components that have been fully migrated
 */
export function loadFromTypeScriptOnly(
  definition: ComponentDefinition,
  children_ids?: string[]
) {
  const cacheKey = definition.panel.containerUuid;
  if (componentCache.has(cacheKey)) {
    return componentCache.get(cacheKey)!;
  }

  // Serialize TypeScript definition to BlockConfig format
  const blockConfig: BlockConfig = serializeComponentDefinition(definition);
  const configKey = getConfigKey(definition.type);

  // Generate field components from serialized config
  const fieldComponents = generateFromConfig(blockConfig, configKey);

  // Generate handlers from events defined in ComponentDefinition
  const handlerComponents = definition.events && definition.events.length > 0
    ? createHandlersFromEvents(
        definition.events.map(e => ({ name: e, label: e })),
        definition.type
      )
    : [];

  // Determine parent UUID and children
  const baseId = definition.panel.containerUuid.replace('_collapse_container', '');
  const parentUuid = `${baseId}_blocks`;
  const defaultChildrenIds = [definition.panel.containerUuid];

  // Build parent container
  const parentContainer = {
    uuid: parentUuid,
    application_id: "1",
    name: `Parent ${definition.name} Container`,
    type: "container",
    ...COMMON_ATTRIBUTES,
    style: {
      display: "flex",
      "flex-direction": "column",
    },
    children_ids: children_ids || defaultChildrenIds,
  };

  // Combine all components
  const result = [parentContainer, ...fieldComponents, ...handlerComponents];

  // Cache the result
  componentCache.set(cacheKey, result);

  return result;
}

export default {
  loadFromTypeScript,
  loadFromTypeScriptOnly,
};
