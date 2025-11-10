/**
 * Property Block Processor - Main Entry Point
 * 
 * Direct exports from the refactored property block generation system.
 */

import { ComponentType } from "@shared/redux/store/component/component.interface.ts";
import { BlockGenerator } from './generators/block-generator.ts';
import { ConfigLoader } from './config-loader.ts';
import { HandlerResolver } from './handler-resolver.ts';

// Re-export types
export type { PropertyConfig, BlockConfig, GenericConfig, SizeConfig } from './types.ts';

// Direct function exports
export const generateBlockComponents = BlockGenerator.generateBlockComponents.bind(BlockGenerator);
export const generateSizeComponents = BlockGenerator.generateSizeComponents.bind(BlockGenerator);
export const generateFromConfig = BlockGenerator.generateFromConfig.bind(BlockGenerator);
export const parseYaml = ConfigLoader.parseYaml.bind(ConfigLoader);
export const convertToYaml = ConfigLoader.convertToYaml.bind(ConfigLoader);
export const loadConfig = ConfigLoader.loadConfig.bind(ConfigLoader);
export const resolveHandler = HandlerResolver.resolveHandler.bind(HandlerResolver);

// Generate the components for default export
const generatedSizeComponents = generateSizeComponents();

// Add the divider that's referenced
const divider = {
  uuid: "divider",
  name: "divider",
  component_type: ComponentType.Divider,
  application_id: "1",
  input: {}
};

export default [divider, ...generatedSizeComponents];
