import { ComponentType } from "../interface";
import { COMMON_ATTRIBUTES } from "../helper/common_attributes";
export default [
    {
        uuid: "display_block",
        applicationId: "1",
        name: "display block",
        component_type: ComponentType.VerticalContainer,
        styleHandlers: {},
        input: {
            direction: "vertical",
        },
        ...COMMON_ATTRIBUTES,
        style: {
            display:'flex',
            'flex-direction':'column'
        },

        childrenIds: ["display_label", "display_radio"],
    },
    
    {
        uuid: "display_label",
        name: "display label",
        component_type: ComponentType.TextLabel,
        applicationId: "1",
        ...COMMON_ATTRIBUTES,
        input:{
            value:{
                type:'handler',
                value:/* js */`
                const displayLabel='Display';
                displayLabel;
                
                `
            }
        },
        style: {

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
                const currentDisplay = currentComponent.input?.display?.value || 'show';
                const options = 
                    [
                    {
                    icon: "eye",
                    value: "show",
                    }, 
                    {
                    icon: "eye-slash",
                    value: "none"
                   }
            ]   
            const radioType ='button'
            const result = [options,currentDisplay,radioType];
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
                    const displayValue = EventData.value;
                    updateInput(currentComponent,'display','string',displayValue)
                }
            }catch(error){
                console.log(error);
            }  
      `
        },
    }

]