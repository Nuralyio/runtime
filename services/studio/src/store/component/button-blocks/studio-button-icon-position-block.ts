import { ComponentType } from "../interface";
import { COMMON_ATTRIBUTES } from "../helper/common_attributes";
export default [
    {
        uuid: "button_icon_position_block",
        applicationId: "1",
        name: "button icon position block",
        component_type: ComponentType.VerticalContainer,
        ...COMMON_ATTRIBUTES,
        style: {
            display:'flex',
            'flex-direction':'column'
        },

        childrenIds: ["icon_position_label", "icon_position_radio"],
    },
    
    {
        uuid: "icon_position_label",
        name: "icon position label",
        component_type: ComponentType.TextLabel,
        applicationId: "1",
        ...COMMON_ATTRIBUTES,
        input:{
            value:{
                type:'handler',
                value:/* js */`
                const iconPositionLabel='Icon position';
                iconPositionLabel;
                
                `
            }
        },
        style: {

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
                const currentIconPosition = currentComponent.input?.iconPosition?.value || 'left';
                const options = 
                    [
                    {
                    label: "Left",
                    value: "left",
                    }, 
                    {
                    label: "Right",
                    value: "right"
                   }
            ]   
            const radioType ='button'
            const result = [options,currentIconPosition,radioType];
            result;
                `
            }
        },
        style: {
            display:'block',
            width: "350px",
        },
        event: {
            changed: /* js */ `
            try{
                const selectedComponens =  GetVar( "selectedComponents")||[];
                if( selectedComponens.length) {
                    const selectedComponent = selectedComponens[0];
                    const currentComponent = GetComponent(selectedComponent, GetVar("currentEditingApplication").uuid)
                    const iconPositionValue = EventData.value;
                    updateInput(currentComponent,'iconPosition','string',iconPositionValue)
                }
            }catch(error){
                console.log(error);
            }  
      `
        },
    }

]