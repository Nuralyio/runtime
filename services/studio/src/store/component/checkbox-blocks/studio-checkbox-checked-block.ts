import { ComponentType } from "../interface";
import { COMMON_ATTRIBUTES } from "../helper/common_attributes";
export default [
    {
        uuid: "checkbox_checked_block",
        applicationId: "1",
        name: "checkbox checked block",
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

        childrenIds: ["checkbox_checked_label", "checkbox_checked_radio"],
    },
    
    {
        uuid: "checkbox_checked_label",
        name: "checkbox checked label",
        component_type: ComponentType.TextLabel,
        applicationId: "1",
        ...COMMON_ATTRIBUTES,
        input:{
            value:{
                type:'handler',
                value:/* js */`
                const checkedLabel='Checked';
                checkedLabel;
                
                `
            }
        },
        style: {

        }
    },
    {
        uuid: "checkbox_checked_radio",
        applicationId: "1",
        component_type: ComponentType.RadioButton,
        ...COMMON_ATTRIBUTES,
        styleHandlers: {},
        name: "checkbox checked radio",
        input: {
            value: {
                type: "handler",
                value: /* js */ ` 
                const selectedComponens =  GetVar( "selectedComponents")||[];
                const selectedComponent = selectedComponens[0];
                const currentComponent = GetComponent(selectedComponent, GetVar("currentEditingApplication").uuid)
                const currentCheck = currentComponent.input?.checked?.value || 'uncheck';
                const options = 
                    [
                    {
                    icon: "check",
                    value: "check",
                    }, 
                    {
                    icon: "xmark",
                    value: "uncheck"
                   }
            ]   
            const radioType ='button'
            const result = [options,currentCheck,radioType];
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
                    const checkedValue = EventData.value;
                    updateInput(currentComponent,'checked','string',EventData.value)
                }
            }catch(error){
                console.log(error);
            }  
      `
        },
    }

]