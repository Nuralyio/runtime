import { ComponentType } from "$store/component/interface.ts";
import { COMMON_ATTRIBUTES } from "../helper/common_attributes.ts";
import { StudioButtonTheme } from "../editor/right-panel-tabs/button/theme.ts";
import { RadioButtonWithTwoOptionsTheme } from "../editor/utils/common-editor-theme.ts";

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
      ...RadioButtonWithTwoOptionsTheme
    },
    input: {
      value: {
        type: "handler",
        value: /* js */ `
             const selectedComponents = GetVar("selectedComponents") || [];
              const selectedComponent = selectedComponents[0];
          
              if (!selectedComponent) {
                  // Return default values if no component is selected
                  return [
                      [
                          { value: 'normal', label: "Normal", disabled: false },
                          { value: 'bold', label: "Bold", disabled: false },
                      ],
                      'normal',
                      'button'
                  ];
              }
          
              const currentEditingApplication = GetVar("currentEditingApplication");
              const currentComponent = GetComponent(selectedComponent, currentEditingApplication?.uuid);
          
              if (!currentComponent) {
                  // Return default values if the current component is not found
                  return [
                      [
                          { value: 'normal', label: "Normal", disabled: false },
                          { value: 'bold', label: "Bold", disabled: false },
                      ],
                      'normal',
                      'button'
                  ];
              }
          
              const hasFontWeightHandler = currentComponent.styleHandlers?.['font-weight'];
              const defaultFontWeight = hasFontWeightHandler
                  ? ''
                  : currentComponent.style?.['font-weight'] || 'normal';
          
              const options = [
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
           try{
                const selectedComponens =  GetVar( "selectedComponents")||[];
                if(selectedComponens.length) {
                    const selectedComponent = selectedComponens[0];
                    const currentComponent = GetComponent(selectedComponent, GetVar("currentEditingApplication").uuid)
                    const fontWeightValue = EventData.value?EventData.value:'normal'
                    updateStyle(currentComponent, "font-weight", fontWeightValue);
                }
            }catch(error){
                console.log(error);
            }
            
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
                let fontWeightHandler=''
                try{
                    const selectedComponens =  GetVar( "selectedComponents")||[];
                    if( selectedComponens.length) {
                    const selectedComponent = selectedComponens[0];
                    const currentComponent = GetComponent(selectedComponent, GetVar("currentEditingApplication").uuid)    
                    fontWeightHandler= currentComponent?.styleHandlers && currentComponent?.styleHandlers['font-weight'] || ''  
                    }
                }catch(error){
                    console.log(error);
                }
                return [parameter,fontWeightHandler];
            `
      }
    },

    event: {
      codeChange: /* js */ `
            try{
                const selectedComponens =  GetVar( "selectedComponents")||[];
                if(selectedComponens.length) {
                    const selectedComponent = selectedComponens[0];
                    let currentComponent = GetComponent(selectedComponent, GetVar("currentEditingApplication").uuid)
                    updateStyleHandlers(currentComponent,'font-weight',EventData.value)
                }
            }catch(error){
                console.log(error);
            }
      `
    }
  }
];
