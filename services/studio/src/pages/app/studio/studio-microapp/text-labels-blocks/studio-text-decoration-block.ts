import { ComponentType } from "$store/component/interface.ts";
import { COMMON_ATTRIBUTES } from "../helper/common_attributes.ts";

export default [
  {
    uuid: "text_decoration_block",
    applicationId: "1",
    name: "Left panel",
    component_type: ComponentType.VerticalContainer,
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
    childrenIds: ["text_label_text_decoration", "text_decoration_content", "text_decoration_handler"]
  },
  {
    uuid: "text_label_text_decoration",
    name: "text_label",
    component_type: ComponentType.TextLabel,
    parameters: {
      value: "Text decoration"
    },
    applicationId: "1",
    ...COMMON_ATTRIBUTES,
    input: {
      value: {
        type: "handler",
        value: /* js */`
                return 'Text decoration';
                `
      }
    },
    style: {
      width: "90px"
    }
  },
  {
    uuid: "text_decoration_content",
    name: "name",
    applicationId: "1",
    component_type: ComponentType.RadioButton,
    styleHandlers: {},
    ...COMMON_ATTRIBUTES,
    style: {
      "--hybrid-button-height": "30px",
      "--hybrid-button-width": "32px"
    },
    input: {
      value: {
        type: "handler",
        value: /* js */ `
                const selectedComponens =  GetVar( "selectedComponents")||[];
                const selectedComponent = selectedComponens[0];
                const currentComponent = GetComponent(selectedComponent, GetVar("currentEditingApplication").uuid)
                let defaultTextDecoration=''
                let isDisabled = false;
                if(currentComponent.styleHandlers && currentComponent?.styleHandlers['text-decoration']) {
                    isDisabled = true
                }
                else
                defaultTextDecoration = currentComponent.style['text-decoration'] ||'none';

                const options =[{value:'overline',icon: "font-awesome",disabled:isDisabled},
                                {value:'line-through',icon: "strikethrough",disabled:isDisabled},
                                {value:'underline',icon: "underline",disabled:isDisabled},
                                {value:'underline overline',icon: "grip-lines",disabled:isDisabled},
                                {value:'none',icon: "xmark",disabled:isDisabled}]


                const radioType='button';
                const result =[options,defaultTextDecoration,radioType];
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
                    const textDecorationValue = EventData.value?EventData.value:'none'
                    updateStyle(currentComponent, "text-decoration", textDecorationValue);
                }
            }catch(error){
                console.log(error);
            }   
      `
    }
  },
  {
    uuid: "text_decoration_handler",
    applicationId: "1",
    component_type: ComponentType.Event,
    ...COMMON_ATTRIBUTES,
    styleHandlers: {},
    name: "text decoration handler",
    style: {
      display: "block",
      width: "250px"
    },
    input: {
      value: {
        type: "handler",
        value: /* js */`
                const parameter ='textDecoration';
                let textDecorationHandler =''
                try{
                    const selectedComponens =  GetVar( "selectedComponents")||[];
                    if( selectedComponens.length) {
                    const selectedComponent = selectedComponens[0];
                    const currentComponent = GetComponent(selectedComponent, GetVar("currentEditingApplication").uuid)    
                    textDecorationHandler= currentComponent?.styleHandlers && currentComponent?.styleHandlers['text-decoration'] || ''  
                    }
                }catch(error){
                    console.log(error);
                }
                return [parameter,textDecorationHandler];
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
                    updateStyleHandlers(currentComponent,'text-decoration',EventData.value)
                }
            }catch(error){
                console.log(error);
            }
      `
    }
  }
];