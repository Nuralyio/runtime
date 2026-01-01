/**
 * Common Properties Registry
 * 
 * Central registry for reusable property blocks referenced by UUID in component configs.
 * 
 * @example
 * ```yaml
 * includeCommonProperties:
 *   - component_value_text_block  # Component name editor
 *   - component_id_text_block     # Component ID display
 * ```
 */

import { StudioComponentIdInput } from "../core/inputs/id.ts";
import { StudioComponentNameInput } from "../core/inputs/name.ts";
import StudioDisplayBlock from "../core/inputs/display.ts";
import { StudioComponentHashInput } from "../core/inputs/hash.ts";

/**
 * Registry mapping UUIDs to component arrays.
 *
 */
export const COMMON_PROPERTIES_MAP: Record<string, any[]> = {
  component_value_text_block: StudioComponentNameInput,
  component_id_text_block: StudioComponentIdInput,
  display_block: StudioDisplayBlock,
  component_hash_text_block: StudioComponentHashInput,
  component_refs_block: [],
};

/**
 * Retrieve common property block by UUID.
 * 
 * @description
 * Looks up a registered common property block by its UUID and returns
 * the associated component array. Returns undefined if the UUID is not
 * registered in the COMMON_PROPERTIES_MAP.
 * 
 * **Use Cases:**
 * - Component generators resolving `includeCommonProperties` references
 * - Custom tooling building component hierarchies
 * - Debug/inspection tools examining available blocks
 * 
 * **Behavior:**
 * - Returns component array if UUID found
 * - Returns undefined if UUID not registered (graceful degradation)
 * - Does not throw errors (safe to call with any string)
 * - Returns reference (not clone) for performance
 * 
 * @param {string} blockUuid - The UUID of the common property block to retrieve
 * @returns {any[] | undefined} Component array if found, undefined otherwise
 * 
 *  */
export function getCommonPropertyBlock(blockUuid: string): any[] | undefined {
  return COMMON_PROPERTIES_MAP[blockUuid];
}

/**
 * Check if a block UUID is registered as a common property.
 * 
 * @description
 * Validates whether a given UUID exists in the common properties registry.
 * Useful for configuration validation and error checking before attempting
 * to retrieve a block.
 * 
 * **Use Cases:**
 * - Configuration validation at load time
 * - Error prevention in block generation
 * - Debug tools checking block availability
 * - User-facing block picker UIs
 * ```
 */
export function isCommonPropertyBlock(blockUuid: string): boolean {
  return blockUuid in COMMON_PROPERTIES_MAP;
}

/**
 * Get all available common property block UUIDs.
 * 
 * @description
 * Returns an array of all registered common property block UUIDs.
 * Useful for debugging, documentation, validation, and building
 * UI tools that need to display available blocks.
 * 
 * **Use Cases:**
 * - Debug logging and inspection
 * - Configuration documentation generation
 * - UI block picker components
 * - Validation error messages
 * - Testing and verification
 * 
 * **Properties:**
 * - Returns array of UUID strings
 * - Order is not guaranteed (object key iteration)
 * - Fresh array on each call (safe to modify)
 * - Empty array if registry is empty
 * 
 * @returns {string[]} Array of all registered block UUIDs
 */
export function getAvailableCommonBlocks(): string[] {
  return Object.keys(COMMON_PROPERTIES_MAP);
}
