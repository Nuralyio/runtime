import { ComponentType } from "$store/component/interface.ts";
import { COMMON_ATTRIBUTES } from "../helper/common_attributes.ts";
import { RadioButtonWithThreeOptionsTheme } from "../editor/utils/common-editor-theme.ts";

export default [
  {
    uuid: "size_block",
    applicationId: "1",
    name: "size block",
    component_type: ComponentType.Container,
    ...COMMON_ATTRIBUTES,
    style: {
      display: "flex",
      "align-items": "center",
      "justify-content": "space-between",
      "width": "290px"
    },

    childrenIds: ["size_radio_block", "size_handler_block"]
  },
  {
    uuid: "size_radio_block",
    applicationId: "1",
    name: "placeholder block",
    component_type: ComponentType.Container,
    ...COMMON_ATTRIBUTES,
    style: {
      display: "flex",
      "align-items": "center",
      "justify-content": "space-between"
    },
    childrenIds: ["size_label"]
  },

  {
    uuid: "size_label",
    name: "size label",
    component_type: ComponentType.TextLabel,
    applicationId: "1",
    ...COMMON_ATTRIBUTES,
    input: {
      value: {
        type: "string",
        value: 'Size'
      }
    },
    style: {
      width: "90px",
      marginLeft: "5px"

    }
  },
  {
    uuid: "size_radio",
    applicationId: "1",
    component_type: ComponentType.RadioButton,
    name: "size select",
    input: {
      value: {
        type: "handler",
        value: /* js */ ` 
                const selectedComponens =  GetVar( "selectedComponents")||[];
                const selectedComponent = selectedComponens[0];
                const currentComponent = GetComponent(selectedComponent, GetVar("currentEditingApplication").uuid)
                let isDisabled = false;
                let currentSize =''
                if(currentComponent.styleHandlers && currentComponent?.styleHandlers?.size) {
                    isDisabled = true
                }
                else
                currentSize = currentComponent.style && currentComponent.style['size'] || 'medium'
                const options = 
                    [
                        {   label:'Small',
                            value: "small",
                            disabled:isDisabled
                        },
                        {   label:'Medium',
                            value: "medium",
                            disabled:isDisabled

                        },
                        {   label:'Large',
                            value: "large",
                            disabled:isDisabled

                        }
            ]   
            const radioType ='button'
            const result = [options,currentSize,radioType];
           return  result;
                `
      }
    },
    style: {
      ...RadioButtonWithThreeOptionsTheme
    },
    event: {
      changed: /* js */ `

            try{
                const selectedComponens =  GetVar( "selectedComponents")||[];
                if( selectedComponens.length) {
                    const selectedComponent = selectedComponens[0];
                    const currentComponent = GetComponent(selectedComponent, GetVar("currentEditingApplication").uuid)
                    const sizeValue = EventData.value;
                    updateStyle(currentComponent,'size',sizeValue)
                }
            }catch(error){
                console.log(error);
            }  
      `
    }
  },
  {
    uuid: "size_handler_block",
    applicationId: "1",
    name: "status handler block",
    component_type: ComponentType.Container,
    ...COMMON_ATTRIBUTES,
    style: {
      display: "flex",
      "justify-content": "space-between",
      "align-items": "center"
    },

    childrenIds: ["size_radio", "size_handler"]
  },
  {
    uuid: "size_handler",
    applicationId: "1",
    component_type: ComponentType.Event,
    ...COMMON_ATTRIBUTES,
    styleHandlers: {},
    name: "size handler",
    style: {
      display: "block"
    },
    input: {
      value: {
        type: "handler",
        value: /* js */`
                const parameter ='size';
                let sizeHandler=''
                try{
                    const selectedComponens =  GetVar( "selectedComponents")||[];
                    if( selectedComponens.length) {
                    const selectedComponent = selectedComponens[0];
                    const currentComponent = GetComponent(selectedComponent, GetVar("currentEditingApplication").uuid)    
                    sizeHandler = currentComponent?.styleHandlers && currentComponent?.styleHandlers['size'] || ''  
                    }
                }catch(error){
                    console.log(error);
                }
                return [parameter,sizeHandler];
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
                    updateStyleHandlers(currentComponent,'size',EventData.value)
                }
            }catch(error){
                console.log(error);
            }
      `
    }
  }

];