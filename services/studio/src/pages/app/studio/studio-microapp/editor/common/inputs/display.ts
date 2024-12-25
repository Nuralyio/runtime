import { ComponentType } from "$store/component/interface.ts";
import { COMMON_ATTRIBUTES } from "../../../helper/common_attributes.ts";
import { InputBlockContainerTheme, InputTextLabelTheme } from "../../utils/common-editor-theme.ts";

export default [
  {
    uuid: "display_block",
    applicationId: "1",
    name: "display block",
    component_type: ComponentType.VerticalContainer,
    ...COMMON_ATTRIBUTES,
    style: {
      ...InputBlockContainerTheme
    },
    childrenIds: ["display_label", "display_handler_block"]
  },
  {
    uuid: "display_label",
    name: "display label",
    component_type: ComponentType.TextLabel,
    applicationId: "1",
    ...COMMON_ATTRIBUTES,
    input: {
      value: {
        type: "handler",
        value:/* js */`
                const displayLabel='Display';
                return displayLabel;
                `
      }
    },
    style: {
      ...InputTextLabelTheme

    }
  },
  {
    uuid: "display_radio",
    applicationId: "1",
    component_type: ComponentType.RadioButton,
    ...COMMON_ATTRIBUTES,
    styleHandlers: {},
    name: "display radio",
    input: {
      value: {
        type: "handler",
        value: /* js */ ` 
                const selectedComponens =  GetVar( "selectedComponents")||[];
                const selectedComponent = selectedComponens[0];
                const currentComponent = GetComponent(selectedComponent, GetVar("currentEditingApplication").uuid)
                let currentDisplay=""
                let isDisabled=false;
                if(currentComponent.input?.display?.type =='handler' && currentComponent.input?.display?.value)
                {
                  isDisabled = true;
                }
                else
                currentDisplay = currentComponent.input?.display?.value || 'show';
                const options = 
                    [
                    {
                    icon: "eye",
                    value: "show",
                    disabled:isDisabled
                    }, 
                    {
                    icon: "eye-slash",
                    value: "none",
                    disabled:isDisabled
                   }
            ]   
            const radioType ='button'
            const result = [options,currentDisplay,radioType];
           return  result;
                `
      }
    },
    style: {
      display: "block",
      "--hybrid-button-height": "30px",
      "--hybrid-button-width": "76px",
      "--hybrid-button-font-size": "12px"
    },
    event: {
      changed: /* js */ `
            try{
                const selectedComponens =  GetVar( "selectedComponents")||[];
                if( selectedComponens.length) {
                    const selectedComponent = selectedComponens[0];
                    const currentComponent = GetComponent(selectedComponent, GetVar("currentEditingApplication").uuid)
                    const displayValue = EventData.value;
                    updateInput(currentComponent,'display','string',displayValue)
                }
            }catch(error){
                console.log(error);
            }  
      `
    }
  },
  {
    uuid: "display_handler_block",
    applicationId: "1",
    name: "icon position handler block",
    component_type: ComponentType.VerticalContainer,
    ...COMMON_ATTRIBUTES,
    style: {

      "margin-top": "10px",
      display: "flex",
      "justify-content": "space-between"
    },

    childrenIds: ["display_radio", "display_handler"]
  },
  {
    uuid: "display_handler",
    applicationId: "1",
    component_type: ComponentType.Event,
    ...COMMON_ATTRIBUTES,
    styleHandlers: {},
    name: "display handler",
    style: {
      display: "block"
    },
    input: {
      value: {
        type: "handler",
        value: /* js */`
                const parameter ='display';
                let displayHandler=''
                try{
                    const selectedComponens =  GetVar( "selectedComponents")||[];
                    if( selectedComponens.length) {
                        const selectedComponent = selectedComponens[0];
                        let currentComponent = GetComponent(selectedComponent, GetVar("currentEditingApplication").uuid)
                        if(currentComponent?.input?.display?.type =='handler' && currentComponent?.input?.display?.value){
                            displayHandler = currentComponent?.input?.display?.value
                        }
                    }
                }catch(error){
                    console.log(error);
                }
                return [parameter,displayHandler];
            `
      }
    },

    event: {
      codeChange: /* js */ `
            try{
                const selectedComponens =  GetVar( "selectedComponents")||[];
                if( selectedComponens.length) {
                    const selectedComponent = selectedComponens[0];
                    let currentComponent = GetComponent(selectedComponent, GetVar("currentEditingApplication").uuid)
                    if(EventData.value != currentComponent?.input?.display?.value)
                    updateInput(currentComponent,'display','handler',EventData.value);
                }
            }catch(error){
                console.log(error);
            }
      `
    }
  },
  {
    uuid: "display_divider",
    name: "divider",
    component_type: ComponentType.Divier,
    applicationId: "1",
    ...COMMON_ATTRIBUTES

  }

];