/**
 * Block Generator
 * Main orchestrator for generating property blocks
 */

import type { BlockConfig, SizeConfig } from '../types.ts';
import { ContainerGenerator } from './container-generator.ts';
import { PropertyGenerator } from './property-generator.ts';
import { getCommonPropertyBlock } from "../../common-properties-registry.ts";
import sizeConfigYaml from "../../../params/_shared/size.config.yaml";
import sizeConfigJson from "../../../params/_shared/size.config.json";

export class BlockGenerator {
  /**
   * Generate components for any block type from JSON/YAML config
   * @param blockConfig - The block configuration object
   * @param blockName - The name of the block (e.g., 'size', 'typography')
   */
  static generateBlockComponents(blockConfig: BlockConfig, blockName: string = 'block'): any[] {
    const components: any[] = [];

    // Generate main container
    components.push(ContainerGenerator.generateMainContainer(blockConfig, blockName));

    // Generate collapse container (now a proper Collapse component with built-in header)
    components.push(ContainerGenerator.generateCollapseContainer(blockConfig, blockName));

    // Generate properties container
    components.push(ContainerGenerator.generatePropertiesContainer(blockConfig, blockName));

    // Generate each property
    blockConfig.properties.forEach(property => {
      components.push(...PropertyGenerator.generateProperty(property));
    });

    return components;
  }
  
  /**
   * Legacy method for backward compatibility with size block
   * Now uses YAML config by default, falls back to JSON if YAML is not available
   */
  static generateSizeComponents(): any[] {
    // Prefer YAML config, fallback to JSON
    const config: SizeConfig = (sizeConfigYaml || sizeConfigJson) as SizeConfig;
    return this.generateBlockComponents(config.sizeInputs, 'size');
  }
  
  /**
   * Generate components from a JSON configuration file
   * 
   * Example usage for a typography block:
   * ```typescript
   * import { generateFromConfig } from './property-block/index.ts';
   * import typographyConfig from './typograpnr-config.json';
   * const typographyComponents = generateFromConfig(
   *   typographyConfig.typographyInputs,
   *   'typography'
   * );
   * ```
   */
  static generateFromConfig(blockConfig: BlockConfig, blockName: string): any[] {
    const components = this.generateBlockComponents(blockConfig, blockName);

    // Process includeCommonProperties if present
    if (blockConfig.includeCommonProperties && blockConfig.includeCommonProperties.length > 0) {
      const commonComponents: any[] = [];
      const commonBlockRootUuids: string[] = [];

      for (const commonBlockUuid of blockConfig.includeCommonProperties) {
        const commonBlock = getCommonPropertyBlock(commonBlockUuid);

        if (commonBlock && commonBlock.length > 0) {
          commonComponents.push(...commonBlock);
          // The first component in each common block is the root container
          commonBlockRootUuids.push(commonBlockUuid);
        } else {
          console.warn(`Common property block "${commonBlockUuid}" not found or empty`);
        }
      }

      // Find the properties container and add common block root UUIDs to its children_ids
      const propertiesContainerUuid = `${blockName}_collapse_container_childrens`;
      const propertiesContainer = components.find(c => c.uuid === propertiesContainerUuid);
      if (propertiesContainer && propertiesContainer.children_ids) {
        propertiesContainer.children_ids = [...propertiesContainer.children_ids, ...commonBlockRootUuids];
      }

      // Append common components to the generated components
      return [...components, ...commonComponents];
    }

    return components;
  }
}
