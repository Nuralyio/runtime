/**
 * Configuration Loader
 * Handles YAML and JSON parsing/conversion
 */

import * as yaml from 'js-yaml';

export class ConfigLoader {
  /**
   * Parse YAML configuration string
   * @param yamlString - YAML configuration as string
   * @returns Parsed configuration object
   */
  static parseYaml(yamlString: string): any {
    try {
      return yaml.load(yamlString);
    } catch (error) {
      console.error('Failed to parse YAML:', error);
      throw new Error(`YAML parsing failed: ${(error as Error).message}`);
    }
  }

  /**
   * Convert JSON configuration to YAML string
   * @param config - Configuration object (JSON)
   * @returns YAML string representation
   */
  static convertToYaml(config: any): string {
    try {
      return yaml.dump(config, {
        indent: 2,
        lineWidth: 120,
        noRefs: true,
        sortKeys: false
      });
    } catch (error) {
      console.error('Failed to convert to YAML:', error);
      throw new Error(`YAML conversion failed: ${(error as Error).message}`);
    }
  }

  /**
   * Load configuration from either JSON or YAML
   * @param config - Either a parsed JSON object or YAML string
   * @returns Parsed configuration object
   */
  static loadConfig(config: any | string): any {
    if (typeof config === 'string') {
      // Try to parse as YAML
      return this.parseYaml(config);
    }
    // Already a parsed object (JSON)
    return config;
  }
}
