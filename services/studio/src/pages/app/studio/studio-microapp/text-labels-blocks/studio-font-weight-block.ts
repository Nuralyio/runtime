import { ComponentType } from "$store/component/interface.ts";
import { COMMON_ATTRIBUTES } from "../helper/common_attributes.ts";
import { StudioButtonTheme } from "../editor/right-panel-tabs/button/theme.ts";
import { RadioButtonWithThreeOptionsTheme, RadioButtonWithTwoOptionsTheme } from "../editor/utils/common-editor-theme.ts";

export default [
  {
    uuid: "font_weight_block",
    application_id: "1",
    name: "label font weight block",
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
    childrenIds: ["text_label_font_weight", "font_weight_content", "font_weight_handler"]
  },
  {
    uuid: "text_label_font_weight",
    name: "label font weight",
    component_type: ComponentType.TextLabel,

    application_id: "1",
    ...COMMON_ATTRIBUTES,
    style: {
      "width": "90px"
    },
    input: {
      value: {
        type: "string",
        value: 'Font weight'
      }
    }
  },
  {
    uuid: "font_weight_content",
    application_id: "1",
    component_type: ComponentType.RadioButton,
    ...COMMON_ATTRIBUTES,
    styleHandlers: {},
    name: "label font weight",

    style: {
      ...RadioButtonWithThreeOptionsTheme,
    },
    input: {
      value: {
        type: "handler",
        value: /* js */ `
        
             const selectedComponents = Utils.first(Vars.selectedComponents)
          
                  // Return default values if no component is selected
                  return [
                      [
                          { value: '300', label: "Slim", disabled: false },
                          { value: 'normal', label: "Normal", disabled: false },
                          { value: 'bold', label: "Bold", disabled: false },
                      ],
                      'normal',
                      'button'
                  ];
          
              
          
              if (!selectedComponents) {
                  // Return default values if the current component is not found
                  return [
                      [
                          { value: '300', label: "Slim", disabled: false },
                          { value: 'normal', label: "Normal", disabled: false },
                          { value: 'bold', label: "Bold", disabled: false },
                      ],
                      'normal',
                      'button'
                  ];
              }
          
              const hasFontWeightHandler = selectedComponents.styleHandlers?.['font-weight'];
              const defaultFontWeight = hasFontWeightHandler
                  ? ''
                  : selectedComponents.style?.['font-weight'] || 'normal';
          
              const options = [
                  { value: '300', label: "Slim", disabled: !!hasFontWeightHandler },
                  { value: 'normal', label: "Normal", disabled: !!hasFontWeightHandler },
                  { value: 'bold', label: "Bold", disabled: !!hasFontWeightHandler },
              ];
          
              const radioType = 'button';
          
              return [options, defaultFontWeight, radioType];         
                `
      }
    },
    event: {
      changed: /* js */ `
      const selectedComponents = Utils.first(Vars.selectedComponents)

                    const fontWeightValue = EventData.value?EventData.value:'normal'
                    updateStyle(selectedComponents, "font-weight", fontWeightValue);
            
      `
    }
  },

  {
    uuid: "font_weight_handler",
    application_id: "1",
    component_type: ComponentType.Event,
    ...COMMON_ATTRIBUTES,
    styleHandlers: {},
    name: "font weight handler",
    style: {
      display: "block"
    },
    input: {
      value: {
        type: "handler",
        value: /* js */`
                const parameter ='fontWeight';
                let fontWeightHandler='';
               const selectedComponents = Utils.first(Vars.selectedComponents)

                    fontWeightHandler= selectedComponents?.styleHandlers && selectedComponents?.styleHandlers['font-weight'] || ''  
                    
                
                return [parameter,fontWeightHandler];
            `
      }
    },

    event: {
      codeChange: /* js */ `
            
                const selectedComponent = Utils.first(Vars.selectedComponents);
                if(true) {
                    
                    
                    updateStyleHandlers(selectedComponent,'font-weight',EventData.value)
                }
            
      `
    }
  }
];
