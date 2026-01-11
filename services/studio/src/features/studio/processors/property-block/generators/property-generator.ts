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
    const translationCollapseUuid = `${property.name}_translation_collapse`;
    const translationToggleUuid = `${property.name}_translation_toggle`;
    const propertyRowUuid = `${property.name}_property_row`;

    // Check if property supports handlers
    const hasHandlerSupport = property.hasHandler || property.type === 'number' || property.type === 'text' || property.type === 'radio';

    // Check if property is translatable (text/textarea with translatable flag)
    const isTranslatable = property.translatable && (property.type === 'text' || property.type === 'textarea');

    // Determine row children_ids based on whether auto checkbox is needed and handler support
    let rowChildrenIds = [labelUuid];

    if (hasHandlerSupport) {
      // If has handler support, use wrapper container
      rowChildrenIds.push(handlerWrapperUuid);
    } else if (property.autoCheckbox) {
      rowChildrenIds.push(inputContainerUuid);
    } else {
      rowChildrenIds.push(inputUuid);
    }

    // For translatable: container has row + collapse; otherwise container is the row
    let containerChildrenIds: string[];
    if (isTranslatable) {
      containerChildrenIds = [propertyRowUuid, translationCollapseUuid];
    } else {
      containerChildrenIds = rowChildrenIds;
    }

    // Property container
    components.push({
      uuid: containerUuid,
      application_id: "1",
      name: `${property.label} Container`,
      type: "container",
      ...COMMON_ATTRIBUTES,
      style: {
        display: "flex",
        "flex-direction": isTranslatable ? "column" : "row",
        "align-items": isTranslatable ? "stretch" : "center",
        "justify-content": "space-between",
        width: "319px",
        "margin-bottom": "8px",
        gap: isTranslatable ? "4px" : "0px"
      },
      children_ids: containerChildrenIds
    });

    // Property row (only for translatable - wraps label + handler wrapper in a row)
    if (isTranslatable) {
      components.push({
        uuid: propertyRowUuid,
        application_id: "1",
        name: `${property.label} Row`,
        type: "container",
        ...COMMON_ATTRIBUTES,
        style: {
          display: "flex",
          "flex-direction": "row",
          "align-items": "center",
          "justify-content": "space-between",
          width: "280px"
        },
        children_ids: rowChildrenIds
      });
    }
    
    // Property label
    components.push({
      uuid: labelUuid,
      application_id: "1",
      name: `${property.label} Label`,
      type: "text_label",
      inputHandlers: {},
      style: {
        width: "100px"
      },
      style_handlers: {},
      styleBreakPoints: {
        mobile: {},
        tablet: {},
        laptop: {}
      },
      attributesHandlers: {},
      errors: {},
      children_ids: [],
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
      let wrapperChildren = property.autoCheckbox ? [inputContainerUuid, handlerUuid] : [inputUuid, handlerUuid];

      // Add translation toggle icon if translatable
      if (isTranslatable) {
        wrapperChildren.push(translationToggleUuid);
      }

      components.push({
        uuid: handlerWrapperUuid,
        application_id: "1",
        name: `${property.label} Handler Wrapper`,
        type: "container",
        inputHandlers: {},
        style: {
          display: "flex",
          "justify-content": "space-between",
          "align-items": "center"
        },
        style_handlers: {},
        styleBreakPoints: {
          mobile: {},
          tablet: {},
          laptop: {}
        },
        attributesHandlers: {},
        errors: {},
        children_ids: wrapperChildren,
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

    // Translation toggle button (if translatable and has handler support)
    if (isTranslatable && hasHandlerSupport) {
      const propName = property.inputProperty || property.name;
      components.push({
        uuid: translationToggleUuid,
        application_id: "1",
        name: `${property.label} Translation Toggle`,
        type: "icon_button",
        inputHandlers: {},
        style: {
          width: "18px",
          height: "18px",
          "min-width": "18px",
          padding: "0"
        },
        style_handlers: {},
        styleBreakPoints: {
          mobile: {},
          tablet: {},
          laptop: {}
        },
        attributesHandlers: {},
        errors: {},
        children_ids: [],
        input: {
          icon: {
            type: "string",
            value: "globe"
          },
          size: {
            type: "string",
            value: "small"
          },
          color: {
            type: "handler",
            value: `return $i18n_${propName}_visible ? 'primary' : 'default';`
          },
          display: {
            type: "handler",
            value: `return $currentEditingApplication?.i18n?.enabled === true && $currentEditingApplication?.i18n?.supportedLocales?.length > 1;`
          }
        },
        event: {
          click: `$i18n_${propName}_visible = !$i18n_${propName}_visible;`
        }
      });
    }

    // Translation collapse component (if translatable)
    if (isTranslatable) {
      const propName = property.inputProperty || property.name;
      components.push({
        uuid: translationCollapseUuid,
        application_id: "1",
        name: `${property.label} Translation Collapse`,
        type: "property_translation_collapse",
        inputHandlers: {
          display: `return $i18n_${propName}_visible === true;`
        },
        style: {
          width: "100%",
          "margin-top": "4px"
        },
        style_handlers: {},
        styleBreakPoints: {
          mobile: {},
          tablet: {},
          laptop: {}
        },
        attributesHandlers: {},
        errors: {},
        children_ids: [],
        input: {
          display: {
            type: "handler",
            value: `return $i18n_${propName}_visible === true;`
          }
        },
        attributes: {
          "property-name": propName
        }
      });
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
      type: "container",
      inputHandlers: {},
      style: {
        display: "flex",
        "align-items": "center"
      },
      style_handlers: {},
      styleBreakPoints: {
        mobile: {},
        tablet: {},
        laptop: {}
      },
      attributesHandlers: {},
      errors: {},
      children_ids: [inputUuid, autoCheckboxUuid],
      input: {}
    });
    
    // Auto checkbox
    components.push({
      uuid: autoCheckboxUuid,
      application_id: "1",
      name: `auto ${property.label} checkbox`,
      type: "checkbox",
      inputHandlers: {},
      style: {
        size: "small"
      },
      style_handlers: {},
      styleBreakPoints: {
        mobile: {},
        tablet: {},
        laptop: {}
      },
      attributesHandlers: {},
      errors: {},
      children_ids: [],
      input: {
        label: {
          type: "handler",
          value: `return 'auto';`
        },
        checked: {
          type: "handler", 
          value: `
            const selectedComponent = Utils.first($selectedComponents);
            if (selectedComponent) {
              return !selectedComponent?.style?.${property.name} || selectedComponent?.input?.${property.name}?.value == 'auto' ? 'check' : '';
            }
          `
        },
        state: {
          type: "handler",
          value: `
            const selectedComponent = Utils.first($selectedComponents);
            if (selectedComponent) {
              return selectedComponent?.style_handlers?.['${property.name}'] ? 'disabled' : 'enabled';
            }
          `
        }
      },
      event: {
        checkboxChanged: `
          const selectedComponent = Utils.first($selectedComponents);
          if (selectedComponent) {
            updateInput(selectedComponent, '${property.name}', 'string', EventData.value ? 'auto' : '');
          }
        `
      }
    });
  }
}
