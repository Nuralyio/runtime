// Dimension-related handlers (width, height, max-width, min-height, etc.)

export const widthValueHandler = /* js */ `
  const selectedComponent = Utils.first(Vars.selectedComponents);
  let isDisabled = false;
  if (selectedComponent?.styleHandlers && selectedComponent?.styleHandlers['width']) {
    isDisabled = true;
  }
  
  let width = Editor.getComponentStyle(selectedComponent, 'width') || 'auto';
  if (width === 'auto' || width.includes('%')) {
    return [width, ''];
  }
  
  let unity = '';
  let value = '';
  width.split('').forEach((char) => {
    if(char >= '0' && char <= '9' || char === '.') {
      value += char;
    } else {
      unity += char;
    }
  });
  return [+value || 0, unity || 'px'];
`;

export const widthEventHandler = /* js */ `
  const selectedComponent = Utils.first(Vars.selectedComponents);
  const unity = EventData.unity || 'px';
  let finalValue = EventData.value;
  
  // Handle special values like 'auto' or percentage
  if (typeof EventData.value === 'string' && (EventData.value === 'auto' || EventData.value.includes('%'))) {
    finalValue = EventData.value;
  } else {
    finalValue = EventData.value + unity;
  }
  
  updateStyle(selectedComponent, "width", finalValue);
`;

export const heightValueHandler = /* js */ `
  const selectedComponent = Utils.first(Vars.selectedComponents);
  let isDisabled = false;
  if (selectedComponent?.styleHandlers && selectedComponent?.styleHandlers['height']) {
    isDisabled = true;
  }
  
  let height = Editor.getComponentStyle(selectedComponent, 'height') || 'auto';
  if (height === 'auto' || height.includes('%')) {
    return [height, ''];
  }
  
  let unity = '';
  let value = '';
  height.split('').forEach((char) => {
    if(char >= '0' && char <= '9' || char === '.') {
      value += char;
    } else {
      unity += char;
    }
  });
  return [+value || 0, unity || 'px'];
`;

export const heightEventHandler = /* js */ `
  const selectedComponent = Utils.first(Vars.selectedComponents);
  const unity = EventData.unity || 'px';
  let finalValue = EventData.value;
  
  // Handle special values like 'auto' or percentage
  if (typeof EventData.value === 'string' && (EventData.value === 'auto' || EventData.value.includes('%'))) {
    finalValue = EventData.value;
  } else {
    finalValue = EventData.value + unity;
  }
  
  updateStyle(selectedComponent, "height", finalValue);
`;

// Generic dimension handler factory for max-width, min-height, etc.
export const createDimensionHandler = (property: string) => ({
  valueHandler: /* js */ `
    const selectedComponent = Utils.first(Vars.selectedComponents);
    let isDisabled = false;
    if (selectedComponent?.styleHandlers && selectedComponent?.styleHandlers['${property}']) {
      isDisabled = true;
    }
    
    let value = Editor.getComponentStyle(selectedComponent, '${property}') || 'auto';
    if (value === 'auto' || value === 'none' || value.includes('%') || value.includes('vh') || value.includes('vw')) {
      return [value, ''];
    }
    
    let unity = '';
    let numValue = '';
    value.split('').forEach((char) => {
      if(char >= '0' && char <= '9' || char === '.') {
        numValue += char;
      } else {
        unity += char;
      }
    });
    return [+numValue || 0, unity || 'px'];
  `,
  
  eventHandler: /* js */ `
    const selectedComponent = Utils.first(Vars.selectedComponents);
    const unity = EventData.unity || 'px';
    let finalValue = EventData.value;
    
    // Handle special values
    if (typeof EventData.value === 'string' && 
        (EventData.value === 'auto' || EventData.value === 'none' || 
         EventData.value.includes('%') || EventData.value.includes('vh') || EventData.value.includes('vw'))) {
      finalValue = EventData.value;
    } else {
      finalValue = EventData.value + unity;
    }
    
    updateStyle(selectedComponent, "${property}", finalValue);
  `
});
