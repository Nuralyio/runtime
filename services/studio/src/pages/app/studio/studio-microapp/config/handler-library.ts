/**
 * GENERIC HANDLER LIBRARY
 * 
 * Reusable handlers for common input patterns.
 * These can be referenced by name in JSON configs instead of inline code.
 */

export const ValueHandlers = {
  // Get component name
  componentName: `
    const selectedComponent = Utils.first(Vars.selectedComponents);
    return selectedComponent?.name || '';
  `,
  
  // Get component input property
  componentInput: (propertyName: string) => `
    const selectedComponent = Utils.first(Vars.selectedComponents);
    return selectedComponent?.input?.${propertyName}?.value || '';
  `,
  
  // Get component style property
  componentStyle: (propertyName: string, defaultValue: string = '') => `
    const selectedComponent = Utils.first(Vars.selectedComponents);
    return Editor.getComponentStyle(selectedComponent, '${propertyName}') || "${defaultValue}";
  `,
  
  // Display toggle (show/hide) with icons
  displayToggle: `
    const selectedComponent = Utils.first(Vars.selectedComponents);
    let currentDisplay = '';
    let isDisabled = false;
    
    if (selectedComponent?.input?.display?.type == 'handler' && !!selectedComponent?.input?.display?.value) {
      isDisabled = true;
    } else {
      currentDisplay = Editor.getComponentBreakpointInput(selectedComponent, 'display')?.value;
    }
    
    const options = [
      { icon: 'eye', value: true, disabled: isDisabled },
      { icon: 'eye-slash', value: false, disabled: isDisabled }
    ];
    
    const radioType = 'button';
    return [options, currentDisplay, radioType];
  `,
  
  // Radio button with options
  radioWithOptions: (propertyName: string, options: any[], defaultValue: any) => `
    const selectedComponent = Utils.first(Vars.selectedComponents);
    const currentValue = Editor.getComponentStyle(selectedComponent, '${propertyName}') || "${defaultValue}";
    const options = ${JSON.stringify(options)};
    const radioType = "button";
    return [options, currentValue, radioType];
  `
};

export const StateHandlers = {
  // Default state - disabled if has style handler
  defaultStyle: (propertyName: string) => `
    const selectedComponent = Utils.first(Vars.selectedComponents);
    return selectedComponent?.styleHandlers?.['${propertyName}'] ? 'disabled' : 'enabled';
  `,
  
  // Input handler state - disabled if has input handler
  inputHandler: (propertyName: string) => `
    const selectedComponent = Utils.first(Vars.selectedComponents);
    return selectedComponent?.inputHandlers?.['${propertyName}'] ? 'disabled' : 'enabled';
  `,
  
  // Value handler state - disabled if input value is a handler
  valueHandler: `
    const selectedComponent = Utils.first(Vars.selectedComponents);
    return selectedComponent?.input?.value?.type === 'handler' && selectedComponent?.input?.value?.value ? 'disabled' : 'enabled';
  `
};

export const EventHandlers = {
  // Update component name
  updateName: `
    const selectedComponent = Utils.first(Vars.selectedComponents);
    if (selectedComponent) {
      updateName(selectedComponent, EventData.value);
    }
  `,
  
  // Update component input property
  updateInput: (propertyName: string, valueType: string = 'string') => `
    const selectedComponent = Utils.first(Vars.selectedComponents);
    if (selectedComponent) {
      updateInput(selectedComponent, '${propertyName}', '${valueType}', EventData.value);
    }
  `,
  
  // Update component style property
  updateStyle: (propertyName: string) => `
    const selectedComponent = Utils.first(Vars.selectedComponents);
    if (!selectedComponent) return;
    updateStyle(selectedComponent, '${propertyName}', EventData.value);
  `,
  
  // Update style with unit (for number inputs)
  updateStyleWithUnit: (propertyName: string, unit: string = 'px') => `
    const selectedComponent = Utils.first(Vars.selectedComponents);
    if (!selectedComponent) return;
    
    let value = EventData.value;
    
    // Add unit if value is not empty and not 'auto'
    if (value && value !== 'auto' && value !== '') {
      // Check if value already has a unit
      if (!/[a-z%]$/i.test(value)) {
        value = value + '${unit}';
      }
    }
    
    updateStyle(selectedComponent, "${propertyName}", value);
  `
};
