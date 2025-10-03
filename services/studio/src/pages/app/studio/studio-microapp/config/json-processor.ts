import { ComponentType } from "$store/component/interface.ts";
import { CollapseHeaderTheme } from "../editor/utils/common-editor-theme.ts";
import { COMMON_ATTRIBUTES } from "../helper/common_attributes.ts";
// Force reload: 2025-10-03-16:55:00
import sizeConfig from "./size-config.json";
import { ValueHandlers, StateHandlers, EventHandlers } from "./handler-library.ts";

/**
 * GENERIC JSON-TO-COMPONENTS PROCESSOR
 * 
 * This replaces the complex factory system with a simple JSON processor
 * that can generate any type of studio block (size, typography, etc.) with much less code.
 */

export interface PropertyConfig {
  name: string;
  label: string;
  type: 'number' | 'select' | 'text' | 'color' | 'boolean' | 'radio';
  default: any;
  unit?: string;
  min?: number;
  max?: number;
  step?: number;
  width?: string;
  placeholder?: string;
  options?: Array<{ value: string; label: string }>;
  autoCheckbox?: boolean;
  // Generic handlers - can be inline code, handler reference, or simple value
  valueHandler?: string | { ref: string; params?: any[] };
  stateHandler?: string | { ref: string; params?: any[] };
  eventHandlers?: {
    [eventName: string]: string | { ref: string; params?: any[] };
  };
  // Handler support (code icon)
  hasHandler?: boolean;  // Whether this property supports handlers
  handlerType?: 'style' | 'input';  // Type of handler (styleHandlers or inputHandlers)
  handlerProperty?: string;  // The property name in the handlers object
  handlerValueGetter?: string | { ref: string; params?: any[] };  // Code to get handler value
  handlerEventUpdate?: string | { ref: string; params?: any[] };  // Code to update handler
}

export interface BlockConfig {
  container: {
    uuid: string;
    name: string;
    style: Record<string, string>;
  };
  collapse: {
    uuid: string;
    title: string;
    style: Record<string, string>;
  };
  properties: PropertyConfig[];
}

export interface GenericConfig {
  [blockName: string]: BlockConfig;
}

interface SizeConfig {
  sizeInputs: BlockConfig;
}

export class GenericJsonProcessor {
  /**
   * Resolve handler reference to actual code
   */
  private static resolveHandler(
    handler: string | { ref: string; params?: any[] } | undefined,
    handlerLibrary: any
  ): string | undefined {
    if (!handler) return undefined;
    
    // If it's already a string, return as-is (backward compatibility)
    if (typeof handler === 'string') return handler;
    
    // Resolve reference
    const { ref, params = [] } = handler;
    const handlerFn = handlerLibrary[ref];
    
    if (!handlerFn) {
      console.warn(`Handler reference "${ref}" not found in library`);
      return undefined;
    }
    
    // If it's a function, call it with params
    if (typeof handlerFn === 'function') {
      return handlerFn(...params);
    }
    
    // Otherwise return the string directly
    return handlerFn;
  }

  /**
   * Generate components for any block type from JSON config
   * @param blockConfig - The block configuration object
   * @param blockName - The name of the block (e.g., 'size', 'typography')
   */
  static generateBlockComponents(blockConfig: BlockConfig, blockName: string = 'block'): any[] {
    const components: any[] = [];
    
    // Generate main container
    components.push(this.generateMainContainer(blockConfig, blockName));
    
    // Generate collapse container
    components.push(this.generateCollapseContainer(blockConfig, blockName));
    
    // Generate collapse header
    components.push(this.generateCollapseHeader(blockConfig, blockName));
    
    // Generate properties container
    components.push(this.generatePropertiesContainer(blockConfig, blockName));
    
    // Generate each property
    blockConfig.properties.forEach(property => {
      components.push(...this.generateProperty(property));
    });
    
    return components;
  }
  
  /**
   * Legacy method for backward compatibility with size block
   */
  static generateSizeComponents(): any[] {
    const config: SizeConfig = sizeConfig as SizeConfig;
    return this.generateBlockComponents(config.sizeInputs, 'size');
  }
  
  /**
   * Generate components from a JSON configuration file
   * 
   * Example usage for a typography block:
   * ```typescript
   * import typographyConfig from './typography-config.json';
   * const typographyComponents = GenericJsonProcessor.generateFromConfig(
   *   typographyConfig.typographyInputs,
   *   'typography'
   * );
   * ```
   */
  static generateFromConfig(blockConfig: BlockConfig, blockName: string): any[] {
    return this.generateBlockComponents(blockConfig, blockName);
  }
  
  private static generateMainContainer(blockConfig: BlockConfig, blockName: string): any {
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
  
  private static generateCollapseContainer(blockConfig: BlockConfig, blockName: string): any {
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
  
  private static generateCollapseHeader(blockConfig: BlockConfig, blockName: string): any {
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
  
  private static generatePropertiesContainer(blockConfig: BlockConfig, blockName: string): any {
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
  
  private static generateProperty(property: PropertyConfig): any[] {
    const components: any[] = [];
    
    // Auto-generate UUIDs from property names
    const containerUuid = `${property.name}_container`;
    const labelUuid = `${property.name}_label`;
    const inputUuid = `${property.name}_input`;
    const handlerUuid = `${property.name}_handler`;
    const autoCheckboxUuid = `auto_${property.name}_checkbox`;
    const inputContainerUuid = `${property.name}_input_container`;
    
    // Determine childrenIds based on whether auto checkbox is needed
    let containerChildrenIds = [labelUuid];
    if (property.autoCheckbox) {
      containerChildrenIds.push(inputContainerUuid);
    } else {
      containerChildrenIds.push(inputUuid);
    }
    
    // Property container
    components.push({
      uuid: containerUuid,
      application_id: "1",
      name: `${property.label} Container`,
      component_type: ComponentType.Container,
      ...COMMON_ATTRIBUTES,
      style: {
        display: "flex",
        "align-items": "center",
        "justify-content": "space-between",
        width: "276px",
        "margin-bottom": "8px"
      },
      childrenIds: containerChildrenIds
    });
    
    // Property label
    components.push({
      uuid: labelUuid,
      application_id: "1",
      name: `${property.label} Label`,
      component_type: ComponentType.TextLabel,
      inputHandlers: {},
      style: {
        width: "70px"
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
    components.push(this.generatePropertyInput(property, inputUuid));
    
    // Auto checkbox and input container (if needed)
    if (property.autoCheckbox) {
      // Input container that holds both input and checkbox
      components.push({
        uuid: inputContainerUuid,
        application_id: "1",
        name: `${property.label} Input Container`,
        component_type: ComponentType.Container,
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
        component_type: ComponentType.Checkbox,
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
    
    // Property handler (code icon support)
    // Generate handler if explicitly requested OR for backward compatibility with number/text
    if (property.hasHandler || property.type === 'number' || property.type === 'text' || property.type === 'radio') {
      components.push(this.generatePropertyHandler(property, handlerUuid));
    }
    
    return components;
  }
  
  private static generatePropertyInput(property: PropertyConfig, inputUuid: string): any {
    const baseInput: any = {
      uuid: inputUuid,
      application_id: "1",
      name: `${property.label} Input`,
      component_type: this.getComponentType(property.type),
      inputHandlers: {},
      styleHandlers: {},
      styleBreakPoints: {
        mobile: {},
        tablet: {},
        laptop: {}
      },
      attributesHandlers: {},
      errors: {},
      childrenIds: [],
      style: {
        display: "block",
        width: property.width || "180px",
        size: "small"
      },
      input: {
        value: {
          type: "handler",
          value: this.resolveHandler(property.valueHandler, ValueHandlers) ||
                 (property.type === 'radio' 
                   ? `
                     const options = ${JSON.stringify(property.options || [])};
                     const selectedComponent = Utils.first(Vars.selectedComponents);
                     const currentValue = Editor.getComponentStyle(selectedComponent, '${property.name}') || "${property.default}";
                     const type = "button";
                     return [options, currentValue, radioType];
                   `
                   : `
                     return Editor.getComponentStyle(Utils.first(Vars.selectedComponents), '${property.name}') || "${property.default}";
                   `)
        },
        state: {
          type: "handler",
          value: this.resolveHandler(property.stateHandler, StateHandlers) ||
                 `
                   const selectedComponent = Utils.first(Vars.selectedComponents);
                   return selectedComponent?.styleHandlers?.['${property.name}'] ? 'disabled' : 'enabled';
                 `
        }
      },
      event: {}
    };
    
    // Add placeholder if provided
    if (property.placeholder) {
      baseInput.input.placeholder = {
        type: "string",
        value: property.placeholder
      };
    }
    
    // Resolve event handlers from references or use custom events
    if (property.eventHandlers) {
      Object.entries(property.eventHandlers).forEach(([eventName, handler]) => {
        const resolvedHandler = this.resolveHandler(handler, EventHandlers);
        if (resolvedHandler) {
          console.log(`[${property.name}] Setting event "${eventName}":`, resolvedHandler.substring(0, 100));
          baseInput.event[eventName] = resolvedHandler;
        } else {
          console.warn(`[${property.name}] Failed to resolve handler for event "${eventName}"`, handler);
        }
      });
    }
    
    // Add event handlers - use event handlers if provided, otherwise use defaults
    if (property.type === 'number' && !property.eventHandlers) {
      // Default events for number inputs
      const defaultEvents = {
        onChange: `
          const selectedComponent = Utils.first(Vars.selectedComponents);
          if (!selectedComponent) return;
          
          let value = EventData.value;
          
          // Add unit if value is not empty and not 'auto'
          if (value && value !== 'auto' && value !== '') {
            // Check if value already has a unit
            if (!/[a-z%]$/i.test(value)) {
              value = value + '${property.unit || 'px'}';
            }
          }
          
          updateStyle(selectedComponent, "${property.name}", value);
        `,
        
        valueChange: `
          const selectedComponent = Utils.first(Vars.selectedComponents);
          if (selectedComponent) {
            updateStyle(selectedComponent, "${property.name}", EventData.value ?? "${property.default}");
          }
        `,
        
        onArrowUp: `
          const selectedComponent = Utils.first(Vars.selectedComponents);
          let ${property.name} = Editor.getComponentStyle(selectedComponent, '${property.name}') || "0${property.unit || 'px'}"
          ${property.name} = ${property.name}.trim();
          let numericPart = "";
          let unitPart = "";

          for (let i = 0; i < ${property.name}.length; i++) {
              if (${property.name}[i] >= '0' && ${property.name}[i] <= '9' || ${property.name}[i] === '.') {
                  numericPart += ${property.name}[i];
              } else {
                  unitPart = ${property.name}.substring(i);
                  break;
              }
          }

          let numericValue = parseFloat(numericPart) || 0;
          let unit = unitPart.trim() || "${property.unit || 'px'}";

          numericValue += ${property.step || 1};
          updateStyle(selectedComponent, "${property.name}", numericValue + unit);
        `,
        
        onArrowDown: `
          const selectedComponent = Utils.first(Vars.selectedComponents);
          if (selectedComponent) {
              let ${property.name} = selectedComponent?.style?.${property.name} || "0${property.unit || 'px'}";
              ${property.name} = ${property.name}.trim();
              let numericPart = "";
              let unitPart = "";

              for (let i = 0; i < ${property.name}.length; i++) {
                  if (${property.name}[i] >= '0' && ${property.name}[i] <= '9' || ${property.name}[i] === '.') {
                      numericPart += ${property.name}[i];
                  } else {
                      unitPart = ${property.name}.substring(i);
                      break;
                  }
              }

              let numericValue = parseFloat(numericPart) || 0;
              let unit = unitPart.trim() || "${property.unit || 'px'}";

              numericValue -= ${property.step || 1};
              updateStyle(selectedComponent, "${property.name}", numericValue + unit);
          }
        `
      };
      
      // Use all default events for number inputs
      Object.assign(baseInput.event, defaultEvents);
    }
    
    // Add default change event for radio buttons (if not already set and no eventHandlers provided)
    if (property.type === 'radio' && !baseInput.event.changed && !property.eventHandlers) {
      baseInput.event.changed = `
        const selectedComponent = Utils.first(Vars.selectedComponents);
        if (!selectedComponent) return;
        
        updateStyle(selectedComponent, "${property.name}", EventData.value);
      `;
    }
    
    // Add default change event for select inputs (if not already set and no eventHandlers provided)
    if (property.type === 'select' && !baseInput.event.changed && !property.eventHandlers) {
      baseInput.event.changed = `
        const selectedComponent = Utils.first(Vars.selectedComponents);
        if (!selectedComponent) return;
        
        updateStyle(selectedComponent, "${property.name}", EventData.value);
      `;
    }
    
    // Add options for select inputs only (radio buttons get options through value array)
    if (property.type === 'select' && property.options) {
      baseInput.input.options = {
        type: "array",
        value: property.options
      };
    }
    
    return baseInput;
  }
  
  private static generatePropertyHandler(property: PropertyConfig, handlerUuid: string): any {
    // Determine handler type (default to 'style' for backward compatibility)
    const handlerType = property.handlerType || 'style';
    const handlerProperty = property.handlerProperty || property.name;
    
    // Resolve custom value getter or use default
    const valueGetter = property.handlerValueGetter 
      ? this.resolveHandler(property.handlerValueGetter, { ...ValueHandlers, ...StateHandlers, ...EventHandlers })
      : `
        const parameter = '${handlerProperty}';
        let handlerValue = '';
        const selectedComponent = Utils.first(Vars.selectedComponents);
        
        if (selectedComponent) {
          ${handlerType === 'style' 
            ? `handlerValue = selectedComponent?.styleHandlers?.['${handlerProperty}'] || '';`
            : `handlerValue = selectedComponent?.inputHandlers?.['${handlerProperty}'] || '';`
          }
        }
        
        return [parameter, handlerValue];
      `;
    
    // Resolve custom event update or use default
    const eventUpdate = property.handlerEventUpdate
      ? this.resolveHandler(property.handlerEventUpdate, { ...ValueHandlers, ...StateHandlers, ...EventHandlers })
      : `
        const selectedComponent = Utils.first(Vars.selectedComponents);
        if (selectedComponent) {
          ${handlerType === 'style'
            ? `updateStyleHandlers(selectedComponent, '${handlerProperty}', EventData.value);`
            : `updateInputHandlers(selectedComponent, '${handlerProperty}', EventData.value);`
          }
        }
      `;
    
    return {
      uuid: handlerUuid,
      application_id: "1",
      name: `${property.label} Handler`,
      component_type: ComponentType.Event,
      ...COMMON_ATTRIBUTES,
      style: {
        display: "block",
      },
      input: {
        value: {
          type: "handler",
          value: valueGetter
        }
      },
      event: {
        codeChange: eventUpdate
      }
    };
  }
  
  private static getComponentType(type: string): ComponentType {
    switch (type) {
      case 'number':
        return ComponentType.TextInput;  // Number inputs use TextInput component
      case 'select':
        return ComponentType.Select;
      case 'color':
        return ComponentType.ColorPicker;
      case 'boolean':
        return ComponentType.Checkbox;
      case 'radio':
        return ComponentType.RadioButton;
      default:
        return ComponentType.TextInput;
    }
  }
  
  private static generateChangeHandler(property: PropertyConfig): string {
    let handler = `
      const selectedComponent = Utils.first(Vars.selectedComponents);
      if (!selectedComponent) return;
      
      let value = EventData.value;
    `;
    
    // Add unit for size properties
    if (property.type === 'number' && property.unit) {
      handler += `
        if (value && value !== 'auto') {
          value = value + '${property.unit}';
        }
      `;
    }
    
    handler += `
      updateStyle(selectedComponent, "${property.name}", value);
    `;
    
    return handler;
  }
}

// Generate the components
const generatedSizeComponents = GenericJsonProcessor.generateSizeComponents();

// Add the divider that's referenced
const divider = {
  uuid: "divider",
  name: "divider",
  component_type: ComponentType.Divider,
  application_id: "1",
  input: {}
};

export default [divider, ...generatedSizeComponents];