// Border-related handlers (border-radius, border-width, etc.)

export const borderRadiusValueHandler = /* js */ `
  const selectedComponent = Utils.first(Vars.selectedComponents);
  let isDisabled = false;
  if (selectedComponent?.styleHandlers && selectedComponent?.styleHandlers['border-radius']) {
    isDisabled = true;
  }
  
  let borderRadius = Editor.getComponentStyle(selectedComponent, 'border-radius') || '0px';
  let unity = '';
  let value = '';
  borderRadius.split('').forEach((char) => {
    if(char >= '0' && char <= '9' || char === '.') {
      value += char;
    } else {
      unity += char;
    }
  });
  return [+value || 0, unity || 'px'];
`;

export const borderRadiusEventHandler = /* js */ `
  const selectedComponent = Utils.first(Vars.selectedComponents);
  const unity = EventData.unity || 'px';
  updateStyle(selectedComponent, "border-radius", EventData.value + unity);
`;

export const borderWidthValueHandler = /* js */ `
  const selectedComponent = Utils.first(Vars.selectedComponents);
  let isDisabled = false;
  if (selectedComponent?.styleHandlers && selectedComponent?.styleHandlers['border-width']) {
    isDisabled = true;
  }
  
  let borderWidth = Editor.getComponentStyle(selectedComponent, 'border-width') || '0px';
  let unity = '';
  let value = '';
  borderWidth.split('').forEach((char) => {
    if(char >= '0' && char <= '9' || char === '.') {
      value += char;
    } else {
      unity += char;
    }
  });
  return [+value || 0, unity || 'px'];
`;

export const borderWidthEventHandler = /* js */ `
  const selectedComponent = Utils.first(Vars.selectedComponents);
  const unity = EventData.unity || 'px';
  updateStyle(selectedComponent, "border-width", EventData.value + unity);
`;

// Generic border handler factory for border-top-width, border-left-radius, etc.
export const createBorderHandler = (property: string) => ({
  valueHandler: /* js */ `
    const selectedComponent = Utils.first(Vars.selectedComponents);
    let isDisabled = false;
    if (selectedComponent?.styleHandlers && selectedComponent?.styleHandlers['${property}']) {
      isDisabled = true;
    }
    
    let value = Editor.getComponentStyle(selectedComponent, '${property}') || '0px';
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
    updateStyle(selectedComponent, "${property}", EventData.value + unity);
  `
});
