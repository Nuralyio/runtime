import { ComponentType } from "$store/component/interface.ts";
import { COMMON_ATTRIBUTES } from "../../../../helper/common_attributes.ts";
import { InputBlockContainerTheme, RadioButtonWithTwoOptionsTheme } from "../../../utils/common-editor-theme.ts";

export default [
  {
    uuid: "button_icon_position_block",
    applicationId: "1",
    name: "button icon position block",
    component_type: ComponentType.Container,
    ...COMMON_ATTRIBUTES,
    style: {
      ...InputBlockContainerTheme
    },

    childrenIds: ["icon_position_radio_block", "icon_position_handler_block"]
  },
  {
    uuid: "icon_position_radio_block",
    applicationId: "1",
    name: "icon position radio block",
    component_type: ComponentType.Container,
    ...COMMON_ATTRIBUTES,
    style: {
      display: "flex",
      "align-items": "center",
      "justify-content": "space-between"
    },
    childrenIds: ["icon_position_label"]
  },

  {
    uuid: "icon_position_label",
    name: "icon position label",
    component_type: ComponentType.TextLabel,
    applicationId: "1",
    ...COMMON_ATTRIBUTES,
    input: {
      value: {
        type: "string",
        value:'Icon position'
      }
    },
    style: {
      width: "90px"

    }
  },
  {
    uuid: "icon_position_radio",
    applicationId: "1",
    component_type: ComponentType.RadioButton,
    ...COMMON_ATTRIBUTES,
    styleHandlers: {},
    name: "icon position radio",
    input: {
      value: {
        type: "handler",
        value: /* js */ ` 
                const selectedComponens =  GetVar( "selectedComponents")||[];
                const selectedComponent = selectedComponens[0];
                const currentComponent = GetComponent(selectedComponent, GetVar("currentEditingApplication").uuid)
                let currentIconPosition=''
                let isDisabled=false
                if(currentComponent.input?.iconPosition?.type=='handler' && currentComponent.input?.iconPosition?.value)
                {
                 isDisabled=true
                }
                else
                currentIconPosition = currentComponent.input?.iconPosition?.value || 'left';
                const options = 
                    [
                    {
                    label: "Left",
                    value: "left",
                    disabled:isDisabled
                    }, 
                    {
                    label: "Right",
                    value: "right",
                    disabled:isDisabled
                   }
            ]   
            const radioType ='button'
            const result = [options,currentIconPosition,radioType];
           return  result;
                `
      }
    },
    style: {
      ...RadioButtonWithTwoOptionsTheme
    },
    event: {
      changed: /* js */ `
            try{
                const selectedComponens =  GetVar( "selectedComponents")||[];
                if( selectedComponens.length) {
                    const selectedComponent = selectedComponens[0];
                    const currentComponent = GetComponent(selectedComponent, GetVar("currentEditingApplication").uuid)
                    const iconPositionValue = EventData.value;
                    updateInput(currentComponent,'iconPosition','value',iconPositionValue)
                }
            }catch(error){
                console.log(error);
            }  
      `
    }
  },
  {
    uuid: "icon_position_handler_block",
    applicationId: "1",
    name: "icon position handler block",
    component_type: ComponentType.Container,
    ...COMMON_ATTRIBUTES,
    style: {

      "margin-top": "10px",
      display: "flex",
      "justify-content": "space-between"
    },

    childrenIds: ["icon_position_radio", "icon_position_handler"]
  },
  {
    uuid: "icon_position_handler",
    applicationId: "1",
    component_type: ComponentType.Event,
    ...COMMON_ATTRIBUTES,
    styleHandlers: {},
    name: "icon position handler",
    style: {
      display: "block",
      width: "50px"
    },
    input: {
      value: {
        type: "handler",
        value: /* js */`
                const parameter ='iconPosition';
                let iconPositionHandler=''
                try{
                    const selectedComponens =  GetVar( "selectedComponents")||[];
                    if( selectedComponens.length) {
                        const selectedComponent = selectedComponens[0];
                        let currentComponent = GetComponent(selectedComponent, GetVar("currentEditingApplication").uuid)
                        if(currentComponent?.input?.iconPosition?.type =='handler' && currentComponent?.input?.iconPosition?.value){
                            iconPositionHandler = currentComponent?.input?.iconPosition?.value
                        }
                    }
                }catch(error){
                    console.log(error);
                }
                return [parameter,iconPositionHandler];
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
                    if(EventData.value != currentComponent?.input?.iconPosition?.value)
                    updateInput(currentComponent,'iconPosition','handler',EventData.value);
                }
            }catch(error){
                console.log(error);
            }
      `
    }
  }

];