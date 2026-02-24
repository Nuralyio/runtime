/**
 * Table Properties Block
 *
 * This file generates table component configuration properties using TypeScript definitions.
 * Migrated from JSON-based config to TypeScript properties.
 */

import { loadFromTypeScript } from "../../../processors/typescript-component-loader.ts";
import { tableDefinition } from "./properties.ts";
import handlersConfig from "./handlers.json";
import themeConfig from "./theme.json";

// Generate table components from TypeScript definition
const generatedTableComponents = loadFromTypeScript(
  tableDefinition,
  handlersConfig,
  themeConfig
);

export default generatedTableComponents;
