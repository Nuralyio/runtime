import { ComponentType } from "../interface";
import { COMMON_ATTRIBUTES } from "../helper/common_attributes";
export default [
    {
        uuid: "table_selectionmode_block",
        applicationId: "1",
        name: "table selection mode block",
        component_type: ComponentType.VerticalContainer,
        ...COMMON_ATTRIBUTES,
        style: {
            display:'flex',
            'flex-direction':'column'
        },

        childrenIds: ["table_selectionmode_label", "table_selectionmode_radio"],
    },
    
    {
        uuid: "table_selectionmode_label",
        name: "table selection mode label",
        component_type: ComponentType.TextLabel,
        applicationId: "1",
        ...COMMON_ATTRIBUTES,
        input:{
            value:{
                type:'handler',
                value:/* js */`
                const selectionModeLabel='Selection mode';
                selectionModeLabel;
                
                `
            }
        },
        style: {

        }
    },
    {
        uuid: "table_selectionmode_radio",
        applicationId: "1",
        component_type: ComponentType.RadioButton,
        ...COMMON_ATTRIBUTES,
        styleHandlers: {},
        name: "selection mode radio",
        input: {
            value: {
                type: "handler",
                value: /* js */ ` 
                const selectedComponens =  GetVar( "selectedComponents")||[];
                const selectedComponent = selectedComponens[0];
                const currentComponent = GetComponent(selectedComponent, GetVar("currentEditingApplication").uuid)
                const currentSelectionMode = currentComponent.input?.selectionMode?.value || 'none';
                const options = 
                    [
                    {
                    label: "Single",
                    value: "single",
                    }, 
                    {
                    label: "Multiple",
                    value: "multiple"
                    },
                    {
                     label:'None',
                     value:'none'
                    }
            ]   
            const radioType ='button'
            const result = [options,currentSelectionMode,radioType];
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
                    const selectionModeValue = EventData.value;
                    updateInput(currentComponent,'selectionMode','string',EventData.value)
                }
            }catch(error){
                console.log(error);
            }  
      `
        },
    }

]