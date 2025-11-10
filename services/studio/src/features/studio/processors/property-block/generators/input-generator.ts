/**
 * Input Generator
 * Generates input components for properties
 */

import { ComponentType } from "@shared/redux/store/component/component.interface.ts";
import type { PropertyConfig } from '../types.ts';
import { HandlerResolver } from '../handler-resolver.ts';
import { ValueHandlers, StateHandlers, EventHandlers } from "../../handler-library.ts";
import { PropertyTypeMapper } from '../utils/property-type-mapper.ts';

export class InputGenerator {
  static generatePropertyInput(property: PropertyConfig, inputUuid: string): any {
    // Event type components (low-code editors) use a different structure
    if (property.type === 'event') {
      return this.generateEventInput(property, inputUuid);
    }
    
    // Icon type components use IconPicker with special input structure
    if (property.type === 'icon') {
      return this.generateIconInput(property, inputUuid);
    }
    
    // Standard input components (text, number, select, color, etc.)
    return this.generateStandardInput(property, inputUuid);
  }
  
  private static generateEventInput(property: PropertyConfig, inputUuid: string): any {
    const valueGetter = property.handlerValueGetter 
      ? HandlerResolver.resolveHandler(property.handlerValueGetter, { ...ValueHandlers, ...StateHandlers, ...EventHandlers })
      : `
        const selectedComponent = Utils.first(Vars.selectedComponents);
        if (!selectedComponent) return ["", ""];
        const handler = selectedComponent?.${property.handlerType || 'input'}Handlers?.['${property.handlerProperty || property.name}'];
        return handler ? [${property.handlerProperty || property.name}, handler] : ["", ""];
      `;
    
    const eventUpdate = property.handlerEventUpdate
      ? HandlerResolver.resolveHandler(property.handlerEventUpdate, { ...ValueHandlers, ...StateHandlers, ...EventHandlers })
      : `
        const selectedComponent = Utils.first(Vars.selectedComponents);
        if (selectedComponent) {
          update${property.handlerType === 'style' ? 'Style' : 'Input'}Handler(selectedComponent, "${property.handlerProperty || property.name}", EventData.handler, EventData.type);
        }
      `;
    
    return {
      uuid: inputUuid,
      application_id: "1",
      name: `${property.label} Event`,
      component_type: ComponentType.Event,
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
        width: property.width || "180px"
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
  
  private static generateIconInput(property: PropertyConfig, inputUuid: string): any {
    const iconInput: any = {
      uuid: inputUuid,
      application_id: "1",
      name: `${property.label} Input`,
      component_type: ComponentType.IconPicker,
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
        width: property.width || "180px"
      },
      input: {
        value: {
          type: "handler",
          value: HandlerResolver.resolveHandler(property.valueHandler, ValueHandlers) ||
                 `
                   const selectedComponent = Utils.first(Vars.selectedComponents);
                   const Input = selectedComponent ? Editor.getComponentBreakpointInput(selectedComponent, '${property.name}') : null;
                   return Input?.value || '';
                 `
        },
        placeholder: {
          type: "handler",
          value: `return '${property.placeholder || 'Choose an icon'}';`
        },
        disable: {
          type: "handler",
          value: HandlerResolver.resolveHandler(property.stateHandler, StateHandlers) ||
                 `
                   const selectedComponent = Utils.first(Vars.selectedComponents);
                   return !!(
                     selectedComponent?.input?.${property.name}?.type === "handler" && 
                     selectedComponent?.input?.${property.name}?.value
                   );
                 `
        }
      },
      event: {}
    };
    
    // Add event handlers
    if (property.eventHandlers) {
      Object.entries(property.eventHandlers).forEach(([eventName, handler]) => {
        const resolvedHandler = HandlerResolver.resolveHandler(handler, EventHandlers);
        if (resolvedHandler) {
          iconInput.event[eventName] = resolvedHandler;
        }
      });
    }
    
    return iconInput;
  }
  
  private static generateStandardInput(property: PropertyConfig, inputUuid: string): any {
    const baseInput: any = {
      uuid: inputUuid,
      application_id: "1",
      name: `${property.label} Input`,
      component_type: PropertyTypeMapper.getComponentType(property.type),
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
          value: HandlerResolver.resolveHandler(property.valueHandler, ValueHandlers) ||
                 (property.type === 'radio' 
                   ? `
                     const options = ${JSON.stringify(property.options || [])};
                     const selectedComponent = Utils.first(Vars.selectedComponents);
                     const currentValue = Editor.getComponentStyle(selectedComponent, '${property.name}') || "${property.default}";
                     const type = "button";
                     return [options, currentValue, type];
                   `
                   : `
                     let e =  Editor.getComponentStyleForState(Utils.first(Vars.selectedComponents), '${property.name}') || "${property.default}"
                     return e;
                   `),
        },
        size: property.type === 'radio' || property.type === 'select' ? {
          type: "string",
          value: "small"
        } : undefined,

        state: {
          type: "handler",
          value: HandlerResolver.resolveHandler(property.stateHandler, StateHandlers) ||
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
        const resolvedHandler = HandlerResolver.resolveHandler(handler, EventHandlers);
        if (resolvedHandler) {
          baseInput.event[eventName] = resolvedHandler;
        } else {
          console.warn(`[Input Generator] Failed to resolve handler for "${property.name}.${eventName}"`, handler);
        }
      });
    }
    
    // Add default events for number inputs
    if (property.type === 'number' && !property.eventHandlers) {
      this.addNumberInputEvents(baseInput, property);
    }
    
    // Add default change event for radio buttons
    if (property.type === 'radio' && !baseInput.event.changed && !property.eventHandlers) {
      baseInput.event.changed = `
        const selectedComponent = Utils.first(Vars.selectedComponents);
        if (!selectedComponent) return;
        
        updateStyle(selectedComponent, "${property.name}", EventData.value);
      `;
    }
    
    // Add default change event for select inputs
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
  
  private static addNumberInputEvents(baseInput: any, property: PropertyConfig): void {
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
    
    Object.assign(baseInput.event, defaultEvents);
  }
}
