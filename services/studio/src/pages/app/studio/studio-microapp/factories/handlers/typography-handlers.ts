// Typography-related handlers (font-size, line-height, letter-spacing, etc.)

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

export const lineHeightValueHandler = /* js */ `
  const selectedComponent = Utils.first(Vars.selectedComponents);
  let isDisabled = false;
  if (selectedComponent?.styleHandlers && selectedComponent?.styleHandlers['line-height']) {
    isDisabled = true;
  }
  
  let lineHeight = Editor.getComponentStyle(selectedComponent, 'line-height') || '1.5';
  // Line height can be unitless or with units
  if (lineHeight.includes('px') || lineHeight.includes('em') || lineHeight.includes('rem')) {
    let unity = '';
    let value = '';
    lineHeight.split('').forEach((char) => {
      if(char >= '0' && char <= '9' || char === '.') {
        value += char;
      } else {
        unity += char;
      }
    });
    return [+value || 1.5, unity];
  } else {
    return [+lineHeight || 1.5, ''];
  }
`;

export const lineHeightEventHandler = /* js */ `
  const selectedComponent = Utils.first(Vars.selectedComponents);
  const unity = EventData.unity || '';
  updateStyle(selectedComponent, "line-height", EventData.value + unity);
`;

export const letterSpacingValueHandler = /* js */ `
  const selectedComponent = Utils.first(Vars.selectedComponents);
  let isDisabled = false;
  if (selectedComponent?.styleHandlers && selectedComponent?.styleHandlers['letter-spacing']) {
    isDisabled = true;
  }
  
  let letterSpacing = Editor.getComponentStyle(selectedComponent, 'letter-spacing') || '0px';
  let unity = '';
  let value = '';
  letterSpacing.split('').forEach((char) => {
    if(char >= '0' && char <= '9' || char === '.' || char === '-') {
      value += char;
    } else {
      unity += char;
    }
  });
  return [+value || 0, unity || 'px'];
`;

export const letterSpacingEventHandler = /* js */ `
  const selectedComponent = Utils.first(Vars.selectedComponents);
  const unity = EventData.unity || 'px';
  updateStyle(selectedComponent, "letter-spacing", EventData.value + unity);
`;
