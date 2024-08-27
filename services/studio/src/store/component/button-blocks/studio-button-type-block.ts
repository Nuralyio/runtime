import { ComponentType } from "../interface";
import { COMMON_ATTRIBUTES } from "../helper/common_attributes";
export default [
    {
        uuid: "button_type_block",
        applicationId: "1",
        name: "button type block",
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

        childrenIds: ["button_type_label", "button_type_select"],
    },
    
    {
        uuid: "button_type_label",
        name: "button type label",
        component_type: ComponentType.TextLabel,
        applicationId: "1",
        ...COMMON_ATTRIBUTES,
        input:{
            value:{
                type:'handler',
                value:/* js */`
                const typeLabel='Type';
                typeLabel;
                
                `
            }
        },
        style: {

        }
    },
    {
        uuid: "button_type_select",
        applicationId: "1",
        component_type: ComponentType.RadioButton,
        ...COMMON_ATTRIBUTES,
        styleHandlers: {},
        name: "button type select",
        input: {
            value: {
                type: "handler",
                value: /* js */ ` 
                const selectedComponens =  GetVar( "selectedComponents")||[];
                const selectedComponent = selectedComponens[0];
                const currentComponent = GetComponent(selectedComponent, GetVar("currentEditingApplication").uuid)
                const currentType = currentComponent.style['type'] || 'default'
                const options = 
                    [
                    {
                    label: "Primary",
                    value: "primary",
                    }, 
                    {
                    label: "Secondary",
                    value: "secondary"
                   },
                    {
                     label: "Danger",
                     value: "danger"
                   },
                   {
                    label: "Ghost",
                    value: "ghost"
                   },
                   {
                    label: "Default",
                    value: "default"
                   },
            ]   
            const radioType ='button'
            const result = [options,currentType,radioType];
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
                    const typeValue = EventData.value;
                    updateStyle(currentComponent,'type',typeValue)
                }
            }catch(error){
                console.log(error);
            }  
      `
        },
    }

]