/**
 * Property Generator
 * Orchestrates generation of complete property components
 */

import { COMMON_ATTRIBUTES } from "../../../core/helpers/common_attributes.ts";
import type { PropertyConfig } from '../types.ts';
import { InputGenerator } from './input-generator.ts';
import { HandlerGenerator } from './handler-generator.ts';

export class PropertyGenerator {
  static generateProperty(property: PropertyConfig): any[] {
    const components: any[] = [];
    
    // Auto-generate UUIDs from property names
    const containerUuid = `${property.name}_container`;
    const labelUuid = `${property.name}_label`;
    const inputUuid = `${property.name}_input`;
    const handlerUuid = `${property.name}_handler`;
    const autoCheckboxUuid = `auto_${property.name}_checkbox`;
    const inputContainerUuid = `${property.name}_input_container`;
    const handlerWrapperUuid = `${property.name}_handler_wrapper`;
    
    // Check if property supports handlers
    const hasHandlerSupport = property.hasHandler || property.type === 'number' || property.type === 'text' || property.type === 'radio';
    
    // Determine childrenIds based on whether auto checkbox is needed and handler support
    let containerChildrenIds = [labelUuid];
    
    if (hasHandlerSupport) {
      // If has handler support, use wrapper container
      containerChildrenIds.push(handlerWrapperUuid);
    } else if (property.autoCheckbox) {
      containerChildrenIds.push(inputContainerUuid);
    } else {
      containerChildrenIds.push(inputUuid);
    }
    
    // Property container
    components.push({
      uuid: containerUuid,
      application_id: "1",
      name: `${property.label} Container`,
      component_type: "vertical-container-block",
      ...COMMON_ATTRIBUTES,
      style: {
        display: "flex",
        "align-items": "center",
        "justify-content": "space-between",
        width: "319px",
        "margin-bottom": "8px"
      },
      childrenIds: containerChildrenIds
    });
    
    // Property label
    components.push({
      uuid: labelUuid,
      application_id: "1",
      name: `${property.label} Label`,
      component_type: "text_label",
      inputHandlers: {},
      style: {
        width: "100px"
      },
      styleHandlers: {},
      styleBreakPoints: {
        mobile: {},
        tablet: {},
        laptop: {}
      },
      attributesHandlers: {},
      errors: {},
      childrenIds: [],
      input: {
        value: {
          type: "string",
          value: property.label
        }
      }
    });
    
    // Property input
    components.push(InputGenerator.generatePropertyInput(property, inputUuid));
    
    // Handler wrapper container (if property has handler support)
    if (hasHandlerSupport) {
      const wrapperChildren = property.autoCheckbox ? [inputContainerUuid, handlerUuid] : [inputUuid, handlerUuid];
      
      components.push({
        uuid: handlerWrapperUuid,
        application_id: "1",
        name: `${property.label} Handler Wrapper`,
        component_type: "vertical-container-block",
        inputHandlers: {},
        style: {
          display: "flex",
          "justify-content": "space-between",
          "align-items": "center"
        },
        styleHandlers: {},
        styleBreakPoints: {
          mobile: {},
          tablet: {},
          laptop: {}
        },
        attributesHandlers: {},
        errors: {},
        childrenIds: wrapperChildren,
        input: {}
      });
    }
    
    // Auto checkbox and input container (if needed)
    if (property.autoCheckbox) {
      this.addAutoCheckbox(components, property, inputContainerUuid, inputUuid, autoCheckboxUuid);
    }
    
    // Property handler (code icon support)
    // Generate handler if explicitly requested OR for backward compatibility with number/text
    if (property.hasHandler || property.type === 'number' || property.type === 'text' || property.type === 'radio') {
      components.push(HandlerGenerator.generatePropertyHandler(property, handlerUuid));
    }
    
    return components;
  }
  
  private static addAutoCheckbox(
    components: any[],
    property: PropertyConfig,
    inputContainerUuid: string,
    inputUuid: string,
    autoCheckboxUuid: string
  ): void {
    // Input container that holds both input and checkbox
    components.push({
      uuid: inputContainerUuid,
      application_id: "1",
      name: `${property.label} Input Container`,
      component_type: "vertical-container-block",
      inputHandlers: {},
      style: {
        display: "flex",
        "align-items": "center"
      },
      styleHandlers: {},
      styleBreakPoints: {
        mobile: {},
        tablet: {},
        laptop: {}
      },
      attributesHandlers: {},
      errors: {},
      childrenIds: [inputUuid, autoCheckboxUuid],
      input: {}
    });
    
    // Auto checkbox
    components.push({
      uuid: autoCheckboxUuid,
      application_id: "1",
      name: `auto ${property.label} checkbox`,
      component_type: "checkbox",
      inputHandlers: {},
      style: {
        size: "small"
      },
      styleHandlers: {},
      styleBreakPoints: {
        mobile: {},
        tablet: {},
        laptop: {}
      },
      attributesHandlers: {},
      errors: {},
      childrenIds: [],
      input: {
        label: {
          type: "handler",
          value: `return 'auto';`
        },
        checked: {
          type: "handler", 
          value: `
            const selectedComponent = Utils.first(Vars.selectedComponents);
            if (selectedComponent) {
              return !selectedComponent?.style?.${property.name} || selectedComponent?.input?.${property.name}?.value == 'auto' ? 'check' : '';
            }
          `
        },
        state: {
          type: "handler",
          value: `
            const selectedComponent = Utils.first(Vars.selectedComponents);
            if (selectedComponent) {
              return selectedComponent?.styleHandlers?.['${property.name}'] ? 'disabled' : 'enabled';
            }
          `
        }
      },
      event: {
        checkboxChanged: `
          const selectedComponent = Utils.first(Vars.selectedComponents);
          if (selectedComponent) {
            updateInput(selectedComponent, '${property.name}', 'string', EventData.value ? 'auto' : '');
          }
        `
      }
    });
  }
}
