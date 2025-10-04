import { StudioComponentIdInput } from "../core/inputs/id.ts";
import { StudioComponentNameInput } from "../core/inputs/name.ts";

/**
 * COMMON PROPERTIES REGISTRY
 * 
 * This registry maps common property block names to their actual component arrays.
 * Used by the JSON processor to resolve includeCommonProperties references.
 */

// Map of block UUID to component arrays
export const COMMON_PROPERTIES_MAP: Record<string, any[]> = {
  // Component Value/Name block
  "component_value_text_block": StudioComponentNameInput,
  
  // Component ID block
  "component_id_text_block": StudioComponentIdInput,
  
  // Component Refs block (for RefComponent)
  // Note: This doesn't exist in the old system, so we'll create a placeholder
  // Users can add the actual implementation later
  "component_refs_block": [],
};

/**
 * Get common property components by block UUID
 */
export function getCommonPropertyBlock(blockUuid: string): any[] | undefined {
  return COMMON_PROPERTIES_MAP[blockUuid];
}

/**
 * Check if a block UUID is a registered common property
 */
export function isCommonPropertyBlock(blockUuid: string): boolean {
  return blockUuid in COMMON_PROPERTIES_MAP;
}

/**
 * Get all available common property block UUIDs
 */
export function getAvailableCommonBlocks(): string[] {
  return Object.keys(COMMON_PROPERTIES_MAP);
}
