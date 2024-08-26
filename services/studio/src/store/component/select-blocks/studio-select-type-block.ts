import { ComponentType } from "../interface";
import { COMMON_ATTRIBUTES } from "../helper/common_attributes";
export default [
    {
        uuid: "select_type_block",
        applicationId: "1",
        name: "select type block",
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

        childrenIds: ["select_type_label", "select_type_radio"],
    },
    
    {
        uuid: "select_type_label",
        name: "select type label",
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
        uuid: "select_type_radio",
        applicationId: "1",
        component_type: ComponentType.RadioButton,
        ...COMMON_ATTRIBUTES,
        styleHandlers: {},
        name: "select type radio",
        input: {
            value: {
                type: "handler",
                value: /* js */ ` 
                const selectedComponens =  GetVar( "selectedComponents")||[];
                const selectedComponent = selectedComponens[0];
                const currentComponent = GetComponent(selectedComponent, GetVar("currentEditingApplication").uuid)
                const currentType = currentComponent.input?.type?.value || 'default';
                const options = 
                    [
                    {
                    label: "Default",
                    value: "default",
                    }, 
                    {
                    label: "Inline",
                    value: "inline"
                   }
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
                    updateInput(currentComponent,'type','string',EventData.value)
                }
            }catch(error){
                console.log(error);
            }  
      `
        },
    }

]