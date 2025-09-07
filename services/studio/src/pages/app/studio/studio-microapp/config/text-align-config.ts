export const textAlignConfig = {
  property: 'text-align',
  label: 'Text align',
  inputType: 'radio' as const,
  defaultValue: 'left',
  options: [
    { value: 'left', icon: "align-left" },
    { value: 'center', icon: "align-center" },
    { value: 'right', icon: "align-right" },
    { value: 'justify', icon: "align-justify" }
  ],
  containerStyle: {
    display: "flex",
    "align-items": "center",
    "justify-content": "space-between",
    "width": "276px"
  },
  labelStyle: {
    width: "90px"
  },
  inputStyle: {
    "--hybrid-button-height": "26px",
    "--hybrid-button-width": "31px"
  },
  // Match existing UUID pattern
  uuidPattern: {
    block: "text_alignement_block",
    label: "text_label_alignement",
    input: "text-align-content",
    handler: "horizontal_alignement_handler"
  }
};

export const verticalAlignConfig = {
  property: 'align-items',
  label: 'Vertical alignment', 
  inputType: 'radio' as const,
  defaultValue: 'start',
  options: [
    { value: 'start', icon: "arrow-up" },
    { value: 'end', icon: "arrow-down" },
    { value: 'center', icon: "align-center" }
  ],
  containerStyle: {
    display: "flex",
    "align-items": "center", 
    "justify-content": "space-between",
    "width": "276px"
  },
  labelStyle: {
    width: "90px"
  },
  inputStyle: {
    "--hybrid-button-height": "26px",
    "--hybrid-button-width": "31px"
  },
  // Match existing UUID pattern
  uuidPattern: {
    block: "text_vertical_alignement_block",
    label: "text_label_vertical_alignement", 
    input: "text_vertical_align_content",
    handler: "vertical_alignement_handler"
  },
  // Custom handler for flexbox alignment
  customHandlers: {
    onValueChange: /* js */ `
      const selectedComponent = Utils.first(Vars.selectedComponents);
      const currentComponentDisplay = selectedComponent.style['display'];
      const verticalAlignValue = EventData.value;
      if(currentComponentDisplay!='flex')
        updateStyle(selectedComponent, "display", 'flex');
      updateStyle(selectedComponent, "align-items", verticalAlignValue);
    `,
    onCodeChange: /* js */ `
      const selectedComponent = Utils.first(Vars.selectedComponents);
      if(true) {
        const currentComponentDisplay = selectedComponent.style['display'];
        if(currentComponentDisplay!='flex')
          updateStyle(selectedComponent, "display", 'flex');
        updateStyleHandlers(selectedComponent,'align-items',EventData.value)
      }
    `,
    getHandlerValue: /* js */`
      const parameter ='verticalAlignement';
      let verticalAlignementHandler=''
      const selectedComponent = Utils.first(Vars.selectedComponents);
      verticalAlignementHandler= selectedComponent?.styleHandlers && selectedComponent?.styleHandlers['align-items'] || ''  
      return [parameter,verticalAlignementHandler];
    `,
    getValue: /* js */ `
      const selectedComponent = Utils.first(Vars.selectedComponents);
      let defaultVerticalAlign='';
      let isDisabled = false;
      if(selectedComponent?.styleHandlers && selectedComponent?.styleHandlers['align-items']) {
        isDisabled = true
      }
      else if ( selectedComponent?.style)
        defaultVerticalAlign = selectedComponent?.style['align-items'] ||'start';
      const options =[
        {value:'start',icon: "arrow-up",disabled:isDisabled},
        {value:'end',icon: "arrow-down",disabled:isDisabled},
        {value:'center',icon:'align-center',disabled:isDisabled}
      ]
      const radioType='button';
      const result =[options,defaultVerticalAlign,radioType];
      return  result;
    `
  }
};
