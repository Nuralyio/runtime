import { ComponentType } from "$store/component/interface.ts";
import { COMMON_ATTRIBUTES } from "../../../helper/common_attributes.ts";
import { InputBlockContainerTheme, InputTextLabelTheme, TextInputTheme } from "../../utils/common-editor-theme.ts";

export const StudioTextValueInput = [
  {
    uuid: "value_text_block",
    applicationId: "1",
    name: "value text block",
    component_type: ComponentType.Container,
    style: {
      ...InputBlockContainerTheme
    },
    childrenIds: ["value_text_label", "value_handler_block"]
  },
  {
    uuid: "value_handler_block",
    applicationId: "1",
    name: "icon picker handler block",
    component_type: ComponentType.Container,
    ...COMMON_ATTRIBUTES,
    style: {
      display: "flex",
      "justify-content": "space-between"
    },

    childrenIds: ["value_text_input", "value_handler"]
  },
  {
    uuid: "value_text_label",
    name: "value text label",
    component_type: ComponentType.TextLabel,
    applicationId: "1",
    style: {
      ...InputTextLabelTheme
    },
    input: {
      value: {
        type: "string",
        value: 'Value'
      }
    }

  },
  {
    uuid: "value_text_input",
    name: "value text input",
    applicationId: "1",
    component_type: ComponentType.TextInput,
    ...COMMON_ATTRIBUTES,
    style: {
      ...TextInputTheme
    },
    event: {
      valueChange:  /* js */ `
                try{
                    const selectedComponens =  GetVar( "selectedComponents")||[];
                    if( selectedComponens.length) {
                        const selectedComponent = selectedComponens[0];
                        const currentComponent = GetComponent(selectedComponent, GetVar("currentEditingApplication").uuid)
                        updateInput(currentComponent,'value','value',EventData.value);
                    }
                }catch(error){
                    console.log(error);
                }`
    },
    input: {
      value: {
        type: "handler",
        value: /* js */`
            try{
            const selectedComponens =  GetVar( "selectedComponents")||[];
            if(selectedComponens.length) {
                const selectedComponent = selectedComponens[0];
                const currentComponent = GetComponent(selectedComponent, GetVar("currentEditingApplication").uuid)                    
                if(currentComponent.input?.value?.type=="value"){
                   const currentValue=currentComponent.input?.value?.value || [];
                   return currentValue;
               }
               return [];
            }

        }catch(e){
            console.log(e);
        }
            `

      },
      state: {
        type: "handler",
        value: /* js */`
            try{
            const selectedComponens =  GetVar( "selectedComponents")||[];
            if(selectedComponens.length) {
                const selectedComponent = selectedComponens[0];
                const currentComponent = GetComponent(selectedComponent, GetVar("currentEditingApplication").uuid)                    
                let state = "unabled";
                if(currentComponent.input?.value?.type =="handler"&&currentComponent.input?.value?.value){
                   state = "disabled"
               }
               return state;
            }

        }catch(e){
            console.log(e);
        }
            `
      }
      ,
      placeholder: {
        type: "string",
        value:"value"
      }
    }
  },

  {
    uuid: "value_handler",
    applicationId: "1",
    component_type: ComponentType.Event,
    ...COMMON_ATTRIBUTES,
    styleHandlers: {},
    name: "value handler",
    style: {
      display: "block"
    },
    input: {
      value: {
        type: "handler",
        value: /* js */`
                const parameter ='value';
                let valueHandler=''
                try{
                    const selectedComponens =  GetVar( "selectedComponents")||[];
                    if( selectedComponens.length) {
                        const selectedComponent = selectedComponens[0];
                        let currentComponent = GetComponent(selectedComponent, GetVar("currentEditingApplication").uuid)
                        if(currentComponent?.input?.value?.type =='handler' && currentComponent?.input?.value?.value){
                           valueHandler = currentComponent?.input?.value?.value
                        }
                    }
                }catch(error){
                    console.log(error);
                }
                return [parameter,valueHandler];
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
                    if(EventData.value != currentComponent?.input?.value?.value)   
                      updateInput(currentComponent,'value','handler',EventData.value);
                
                }
            }catch(error){
                console.log(error);
            }
      `
    }
  }

];