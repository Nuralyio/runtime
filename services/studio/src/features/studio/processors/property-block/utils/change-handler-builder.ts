/**
 * Change Handler Builder
 * Builds onChange handler code for properties
 */

import type { PropertyConfig } from '../types.ts';

export class ChangeHandlerBuilder {
  static generateChangeHandler(property: PropertyConfig): string {
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
