// Position-related handlers (top, left, right, bottom, z-index)

export const positionValueHandler = (property: string) => /* js */ `
  const selectedComponent = Utils.first(Vars.selectedComponents);
  let isDisabled = false;
  if (selectedComponent?.styleHandlers && selectedComponent?.styleHandlers['${property}']) {
    isDisabled = true;
  }
  
  let value = Editor.getComponentStyle(selectedComponent, '${property}') || 'auto';
  if (value === 'auto' || value.includes('%')) {
    return [value, ''];
  }
  
  let unity = '';
  let numValue = '';
  value.split('').forEach((char) => {
    if(char >= '0' && char <= '9' || char === '.' || char === '-') {
      numValue += char;
    } else {
      unity += char;
    }
  });
  return [+numValue || 0, unity || 'px'];
`;

export const positionEventHandler = (property: string) => /* js */ `
  const selectedComponent = Utils.first(Vars.selectedComponents);
  const unity = EventData.unity || 'px';
  let finalValue = EventData.value;
  
  // Handle special values like 'auto' or percentage
  if (typeof EventData.value === 'string' && (EventData.value === 'auto' || EventData.value.includes('%'))) {
    finalValue = EventData.value;
  } else {
    finalValue = EventData.value + unity;
  }
  
  updateStyle(selectedComponent, "${property}", finalValue);
`;

export const zIndexValueHandler = /* js */ `
  const selectedComponent = Utils.first(Vars.selectedComponents);
  let isDisabled = false;
  if (selectedComponent?.styleHandlers && selectedComponent?.styleHandlers['z-index']) {
    isDisabled = true;
  }
  
  let zIndex = Editor.getComponentStyle(selectedComponent, 'z-index') || 'auto';
  if (zIndex === 'auto') {
    return [0, ''];
  }
  
  return [+zIndex || 0, ''];
`;

export const zIndexEventHandler = /* js */ `
  const selectedComponent = Utils.first(Vars.selectedComponents);
  updateStyle(selectedComponent, "z-index", EventData.value || 0);
`;

// Generic position handler factory
export const createPositionHandler = (property: string) => ({
  valueHandler: positionValueHandler(property),
  eventHandler: positionEventHandler(property)
});
