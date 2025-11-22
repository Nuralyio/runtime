/**
 * Container Generator
 * Generates container components for property blocks
 */

import { ComponentType } from "@shared/redux/store/component/component.interface.ts";
import { CollapseHeaderTheme } from "../../../core/utils/common-editor-theme.ts";
import { COMMON_ATTRIBUTES } from "../../../core/helpers/common_attributes.ts";
import type { BlockConfig } from '../types.ts';

export class ContainerGenerator {
  static generateMainContainer(blockConfig: BlockConfig, blockName: string): any {
    return {
      uuid: blockConfig.container.uuid,
      application_id: "1",
      name: blockConfig.container.name,
      component_type: ComponentType.Container,
      ...COMMON_ATTRIBUTES,
      style: blockConfig.container.style,
      childrenIds: [blockConfig.collapse.uuid]
    };
  }
  
  static generateCollapseContainer(blockConfig: BlockConfig, blockName: string): any {
    const childrenIds = [
      "divider",
      `${blockName}_text_label_collapse`,
      `${blockName}_collapse_container_childrens`
    ];

    return {
      uuid: blockConfig.collapse.uuid,
      application_id: "1",
      name: `${blockName} collapse`,
      component_type: ComponentType.Container,
      style: blockConfig.collapse.style,
      childrenIds
    };
  }
  
  static generateCollapseHeader(blockConfig: BlockConfig, blockName: string): any {
    return {
      uuid: `${blockName}_text_label_collapse`,
      name: `${blockName}_text_label_collapse`,
      application_id: "1",
      component_type: ComponentType.TextLabel,
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
    const childrenIds = blockConfig.properties.map(prop => `${prop.name}_container`);
    
    return {
      uuid: `${blockName}_collapse_container_childrens`,
      application_id: "1",
      name: "Properties Container",
      component_type: ComponentType.Container,
      ...COMMON_ATTRIBUTES,
      style: {},
      childrenIds
    };
  }
}
