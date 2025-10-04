// Specialized handlers for different number input types

export const fontSizeValueHandler = /* js */ `
  const selectedComponent = Utils.first(Vars.selectedComponents);
  let isDisabled = false;
  if (selectedComponent?.styleHandlers && selectedComponent?.styleHandlers['fontSize']) {
    isDisabled = true;
  }
  
  let fontSize;
  if(Editor.currentPlatform.platform !== "desktop"){
    fontSize = currentComponent?.breakpoints?.[Editor.currentPlatform.width]?.fontSize?.split('') || selectedComponent.style && selectedComponent.style['fontSize']?.split('')
  }else{
    fontSize = selectedComponent.style && selectedComponent.style?.fontSize?.split('')
  }
  if(fontSize) {
    let unity='';
    let value='';
    fontSize.forEach((char)=>{
      if(char>='0' && char<='9')
        value+=char 
      else 
        unity+=char
    });
    return [+value,unity]
  } else {
    return [13,'px']
  }
`;

export const fontSizeEventHandler = /* js */ `
  const selectedComponent = Utils.first(Vars.selectedComponents);
  const unity = EventData.unity || 'px';
  updateStyle(selectedComponent, "fontSize", EventData.value + unity);
`;

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
    if(char >= '0' && char <= '9') {
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

export const marginPaddingValueHandler = (property: string) => /* js */ `
  const selectedComponent = Utils.first(Vars.selectedComponents);
  let isDisabled = false;
  if (selectedComponent?.styleHandlers && selectedComponent?.styleHandlers['${property}']) {
    isDisabled = true;
  }
  
  let value = Editor.getComponentStyle(selectedComponent, '${property}') || '0px';
  let unity = '';
  let numValue = '';
  value.split('').forEach((char) => {
    if(char >= '0' && char <= '9') {
      numValue += char;
    } else {
      unity += char;
    }
  });
  return [+numValue || 0, unity || 'px'];
`;

export const marginPaddingEventHandler = (property: string) => /* js */ `
  const selectedComponent = Utils.first(Vars.selectedComponents);
  const unity = EventData.unity || 'px';
  updateStyle(selectedComponent, "${property}", EventData.value + unity);
`;
