/**
 * Handler Generator
 * Generates handler (code icon) components for properties
 */

import { COMMON_ATTRIBUTES } from "../../../core/helpers/common_attributes.ts";
import type { PropertyConfig } from '../types.ts';
import { HandlerResolver } from '../handler-resolver.ts';
import { ValueHandlers, StateHandlers, EventHandlers } from "../../handler-library.ts";

export class HandlerGenerator {
  static generatePropertyHandler(property: PropertyConfig, handlerUuid: string): any {
    // Determine handler type (default to 'style' for backward compatibility)
    const handlerType = property.handlerType || 'style';
    const handlerProperty = property.handlerProperty || property.name;
    
    // Resolve custom value getter or use default
    const valueGetter = property.handlerValueGetter
      ? HandlerResolver.resolveHandler(property.handlerValueGetter, { ...ValueHandlers, ...StateHandlers, ...EventHandlers })
      : `
        const parameter = '${handlerProperty}';
        let handlerValue = '';
        const selectedComponent = Utils.first($selectedComponents);

        if (selectedComponent) {
          ${handlerType === 'style'
            ? `// Check style_handlers first, then static handler definition
               handlerValue = selectedComponent?.style_handlers?.['${handlerProperty}'] || '';
               if (!handlerValue && selectedComponent?.style?.['${handlerProperty}']?.type === 'handler') {
                 handlerValue = selectedComponent.style['${handlerProperty}'].value || '';
               }`
            : `// Check inputHandlers first, then static handler definition
               handlerValue = selectedComponent?.inputHandlers?.['${handlerProperty}'] || '';
               if (!handlerValue && selectedComponent?.input?.['${handlerProperty}']?.type === 'handler') {
                 handlerValue = selectedComponent.input['${handlerProperty}'].value || '';
               }`
          }
        }

        return [parameter, handlerValue];
      `;
    
    // Resolve custom event update or use default
    const eventUpdate = property.handlerEventUpdate
      ? HandlerResolver.resolveHandler(property.handlerEventUpdate, { ...ValueHandlers, ...StateHandlers, ...EventHandlers })
      : `
        const selectedComponent = Utils.first($selectedComponents);
        if (selectedComponent) {
          ${handlerType === 'style'
            ? `updateStyleHandlers(selectedComponent, '${handlerProperty}', EventData.value);`
            : `updateInput(selectedComponent, '${handlerProperty}', 'handler', EventData.value);`
          }
        }
      `;
    
    return {
      uuid: handlerUuid,
      application_id: "1",
      name: `${property.label} Handler`,
      type: "event",
      ...COMMON_ATTRIBUTES,
      style: {
        display: "block",
        width: "30px"
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
}
