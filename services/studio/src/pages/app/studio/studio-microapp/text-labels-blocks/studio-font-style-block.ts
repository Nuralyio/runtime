import { ComponentType } from "$store/component/interface.ts";
import { RadioButtonWithThreeOptionsTheme } from "../editor/utils/common-editor-theme.ts";
import { COMMON_ATTRIBUTES } from "../helper/common_attributes.ts";

export default [
  {
    uuid: "font_style_block",
    application_id: "1",
    name: "Left panel",
    component_type: ComponentType.Container,
    styleHandlers: {},
    input: {
      direction: "vertical"
    },
    ...COMMON_ATTRIBUTES,
    style: {
      display: "flex",
      "align-items": "center",
      "justify-content": "space-between",
      "width": "276px"
    },
    childrenIds: ["text_label_font_style", "font_style_content", "font_style_handler"]
  },

  {
    uuid: "text_label_font_style",
    name: "text_label",
    component_type: ComponentType.TextLabel,
    application_id: "1",
    ...COMMON_ATTRIBUTES,
    style: {
      width: "90px"
    },
    input: {
      value: {
        type: "string",
        value: 'Font style'
      }
    }
  },
  {
    uuid: "font_style_content",
    name: "name",
    application_id: "1",
    component_type: ComponentType.RadioButton,
    ...COMMON_ATTRIBUTES,
    style: {
    ...RadioButtonWithThreeOptionsTheme
    },
    input: {
      value: {
        type: "handler",
        value: /* js */ `
                const selectedComponent = Utils.first(Vars.selectedComponents);
                
            
                if (!selectedComponent) {
                    // Return default values if no component is selected
                    return [
                        [
                            { value: 'normal', label: "Normal", disabled: false },
                            { value: 'italic', label: "Italic", disabled: false },
                            { value: 'oblique', label: "Oblique", disabled: false }
                        ],
                        'normal',
                        'button'
                    ];
                }
            
            
                const hasFontStyleHandler = selectedComponent.styleHandlers?.['font-style'];
                const defaultFontStyle = hasFontStyleHandler
                    ? ''
                    : selectedComponent.style?.['font-style'] || 'normal';
            
                const options = [
                    { value: 'normal', label: "Normal", disabled: !!hasFontStyleHandler },
                    { value: 'italic', label: "Italic", disabled: !!hasFontStyleHandler },
                    { value: 'oblique', label: "Oblique", disabled: !!hasFontStyleHandler }
                ];
            
                const radioType = 'button';
            
                return [options, defaultFontStyle, radioType];         
                `
      }
    },
    event: {
      changed: /* js */ `
           
                const selectedComponent = Utils.first(Vars.selectedComponents);
                    
                    
                    const fontStyleValue = EventData.value?EventData.value:'normal'
                    updateStyle(selectedComponent, "font-style", fontStyleValue);
                 
      `
    }
  },

  {
    uuid: "font_style_handler",
    application_id: "1",
    component_type: ComponentType.Event,
    ...COMMON_ATTRIBUTES,
    styleHandlers: {},
    name: "font style handler",
    style: {
      display: "block"
    },
    input: {
      value: {
        type: "handler",
        value: /* js */`
                const parameter ='style';
                let fontStyleHandler=''
                
                    const selectedComponent = Utils.first(Vars.selectedComponents);
                    
                        
                    fontStyleHandler= selectedComponent.styleHandlers && selectedComponent.styleHandlers['font-style'] || ''  
                
                return [parameter,fontStyleHandler];
            `
      }
    },

    event: {
      codeChange: /* js */ `
            
                const selectedComponent = Utils.first(Vars.selectedComponents);
                    
                    
                    updateStyleHandlers(selectedComponent,'font-style',EventData.value)
            
      `
    }
  }
];
