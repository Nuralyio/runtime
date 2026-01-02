/**
 * Component Property Update Functions
 * 
 * Functions for updating component properties (name, input, style, events).
 */

import { ExecuteInstance } from '../../state';
import { updateComponentAttributes, updateComponentName } from '../../redux/actions/component';
import type { ComponentElement } from '../../redux/store/component';

export function createComponentPropertyFunctions() {
  return {
    /**
     * Updates component name
     */
    updateName: (component: ComponentElement, componentName: string) => {
      updateComponentName(component.application_id, component.uuid, componentName);
    },

    /**
     * Updates component input property
     */
    updateInput: (component: ComponentElement, inputName: string, handlerType: string, handlerValue: any) => {
      const eventData = { [inputName]: { type: handlerType, value: handlerValue } };
      updateComponentAttributes(component.application_id, component.uuid, "input", eventData);
    },

    /**
     * Updates component event handler
     */
    updateEvent: (component: ComponentElement, symbol: string, value: any) => {
      const eventData = { [symbol]: value };
      updateComponentAttributes(component.application_id, component.uuid, "event", eventData);
    },

    /**
     * Updates component style, supporting pseudo-states
     */
    updateStyle: (component: ComponentElement, symbol: string, value: any) => {
      // Check if a pseudo-state is selected (e.g., :hover, :focus, :active)
      const selectedState = ExecuteInstance.Vars.selected_component_style_state;
      
      let eventData;
      if (selectedState && selectedState !== "default") {
        // Get existing pseudo-state styles to preserve other properties
        const existingPseudoStateStyles = component.style?.[selectedState] || {};
        
        // If a pseudo-state is selected, merge with existing pseudo-state properties
        eventData = {
          [selectedState]: {
            ...existingPseudoStateStyles,
            [symbol]: value
          }
        };
      } else {
        // Default behavior: set style directly
        eventData = { [symbol]: value };
      }
      
      updateComponentAttributes(component.application_id, component.uuid, "style", eventData);
    },

    /**
     * Updates component style handlers
     */
    updateStyleHandlers: (component: ComponentElement, symbol: string, value: any) => {
      updateComponentAttributes(component.application_id, component.uuid, "style_handlers", { [symbol]: value });
    },
  };
}
