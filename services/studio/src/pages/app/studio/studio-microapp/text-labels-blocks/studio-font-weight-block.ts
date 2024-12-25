import { ComponentType } from "$store/component/interface.ts";
import { COMMON_ATTRIBUTES } from "../helper/common_attributes.ts";

export default [
  {
    uuid: "font_weight_block",
    applicationId: "1",
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
      "width": "290px"
    },
    childrenIds: ["text_label_font_weight", "font_weight_content", "font_weight_handler"]
  },
  {
    uuid: "text_label_font_weight",
    name: "label font weight",
    component_type: ComponentType.TextLabel,

    applicationId: "1",
    ...COMMON_ATTRIBUTES,
    style: {
      "width": "90px"
    },
    input: {
      value: {
        type: "handler",
        value: /* js */`
               return 'Font weight';
            `
      }
    }
  },
  {
    uuid: "font_weight_content",
    applicationId: "1",
    component_type: ComponentType.RadioButton,
    ...COMMON_ATTRIBUTES,
    styleHandlers: {},
    name: "label font weight",

    style: {
      display: "block",
      "--hybrid-button-height": "30px",
      "--hybrid-button-width": "53px",
      "--hybrid-button-font-size": "11px"
    },
    input: {
      value: {
        type: "handler",
        value: /* js */ `
                const selectedComponens =  GetVar( "selectedComponents")||[];
                const selectedComponent = selectedComponens[0];
                const currentComponent = GetComponent(selectedComponent, GetVar("currentEditingApplication").uuid)
                let defaultFontWeight='';
                let isDisabled = false;
                if(currentComponent.styleHandlers && currentComponent?.styleHandlers['font-weight']) {
                    isDisabled = true
                }
                else
                defaultFontWeight = currentComponent.style['font-weight'] ||'normal';
                const options =[{value:'normal',label: "Normal",disabled:isDisabled},
                                {value:'bold',label: "Bold",disabled:isDisabled},
                                {value:'900',label: "Ex.bold",disabled:isDisabled}]
                const radioType='button';
                const result =[options,defaultFontWeight,radioType];
               return  result;           
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
    applicationId: "1",
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
