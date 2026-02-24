/**
 * Container Generator
 * Generates container components for property blocks
 */

import { CollapseHeaderTheme } from "../../../core/utils/common-editor-theme.ts";
import { COMMON_ATTRIBUTES } from "../../../core/helpers/common_attributes.ts";
import type { BlockConfig } from '../types.ts';

export class ContainerGenerator {
  static generateMainContainer(blockConfig: BlockConfig, blockName: string): any {
    return {
      uuid: blockConfig.container.uuid,
      application_id: "1",
      name: blockConfig.container.name,
      type: "container",
      ...COMMON_ATTRIBUTES,
      style: blockConfig.container.style,
      children_ids: [blockConfig.collapse.uuid]
    };
  }
  
  static generateCollapseContainer(blockConfig: BlockConfig, blockName: string): any {
    const children_ids = [`${blockName}_collapse_container_childrens`];

    return {
      uuid: blockConfig.collapse.uuid,
      application_id: "1",
      name: `${blockName} collapse`,
      type: "collapse",
      style: {
        marginTop: "16px",
        marginBottom: "16px",
        "--nuraly-spacing-collapse-padding": "0px",
        "--nuraly-spacing-collapse-content-padding": "6px",
        "--nuraly-shadow-collapse-hover": "none",
        "--nuraly-border-radius-collapse": "0",
        "--nuraly-border-radius-collapse-header": "0",
        ...blockConfig.collapse.style
      },
      input: {
        size: {
          type: "string",
          value: "small"
        },
        components: {
          type: "array",
          value: [{
            blockName: `${blockName}_collapse_container_childrens`,
            label: blockConfig.collapse.title,
            open: true
          }]
        }
      },
      children_ids
    };
  }
  
  static generateCollapseHeader(blockConfig: BlockConfig, blockName: string): any {
    return {
      uuid: `${blockName}_text_label_collapse`,
      name: `${blockName}_text_label_collapse`,
      application_id: "1",
      type: "text_label",
      style: {
        ...CollapseHeaderTheme
      },
      input: {
        value: {
          type: "handler",
          value: `return "${blockConfig.collapse.title}"`
        }
      }
    };
  }
  
  static generatePropertiesContainer(blockConfig: BlockConfig, blockName: string): any {
    const children_ids = blockConfig.properties.map(prop => `${prop.name}_container`);
    
    return {
      uuid: `${blockName}_collapse_container_childrens`,
      application_id: "1",
      name: "Properties Container",
      type: "container",
      ...COMMON_ATTRIBUTES,
      style: {},
      children_ids
    };
  }
}
