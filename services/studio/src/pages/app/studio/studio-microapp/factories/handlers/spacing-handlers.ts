// Spacing-related handlers (margin, padding, gap, etc.)

export const marginValueHandler = /* js */ `
  const selectedComponent = Utils.first(Vars.selectedComponents);
  let isDisabled = false;
  if (selectedComponent?.styleHandlers && selectedComponent?.styleHandlers['margin']) {
    isDisabled = true;
  }
  
  let margin = Editor.getComponentStyle(selectedComponent, 'margin') || '0px';
  let unity = '';
  let value = '';
  margin.split('').forEach((char) => {
    if(char >= '0' && char <= '9' || char === '.' || char === '-') {
      value += char;
    } else {
      unity += char;
    }
  });
  return [+value || 0, unity || 'px'];
`;

export const marginEventHandler = /* js */ `
  const selectedComponent = Utils.first(Vars.selectedComponents);
  const unity = EventData.unity || 'px';
  updateStyle(selectedComponent, "margin", EventData.value + unity);
`;

export const paddingValueHandler = /* js */ `
  const selectedComponent = Utils.first(Vars.selectedComponents);
  let isDisabled = false;
  if (selectedComponent?.styleHandlers && selectedComponent?.styleHandlers['padding']) {
    isDisabled = true;
  }
  
  let padding = Editor.getComponentStyle(selectedComponent, 'padding') || '0px';
  let unity = '';
  let value = '';
  padding.split('').forEach((char) => {
    if(char >= '0' && char <= '9' || char === '.' || char === '-') {
      value += char;
    } else {
      unity += char;
    }
  });
  return [+value || 0, unity || 'px'];
`;

export const paddingEventHandler = /* js */ `
  const selectedComponent = Utils.first(Vars.selectedComponents);
  const unity = EventData.unity || 'px';
  updateStyle(selectedComponent, "padding", EventData.value + unity);
`;

export const gapValueHandler = /* js */ `
  const selectedComponent = Utils.first(Vars.selectedComponents);
  let isDisabled = false;
  if (selectedComponent?.styleHandlers && selectedComponent?.styleHandlers['gap']) {
    isDisabled = true;
  }
  
  let gap = Editor.getComponentStyle(selectedComponent, 'gap') || '0px';
  let unity = '';
  let value = '';
  gap.split('').forEach((char) => {
    if(char >= '0' && char <= '9' || char === '.') {
      value += char;
    } else {
      unity += char;
    }
  });
  return [+value || 0, unity || 'px'];
`;

export const gapEventHandler = /* js */ `
  const selectedComponent = Utils.first(Vars.selectedComponents);
  const unity = EventData.unity || 'px';
  updateStyle(selectedComponent, "gap", EventData.value + unity);
`;

// Generic spacing handler factory for margin-top, padding-left, etc.
export const createSpacingHandler = (property: string) => ({
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
      if(char >= '0' && char <= '9' || char === '.' || char === '-') {
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
