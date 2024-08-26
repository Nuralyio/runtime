import { ComponentType } from "../interface";
import { COMMON_ATTRIBUTES } from "../helper/common_attributes";
export default [
    {
        uuid: "select_selectionmode_block",
        applicationId: "1",
        name: "select selection mode block",
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

        childrenIds: ["select_selectionmode_label", "select_selectionmode_radio"],
    },
    
    {
        uuid: "select_selectionmode_label",
        name: "select selection mode label",
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
        uuid: "select_selectionmode_radio",
        applicationId: "1",
        component_type: ComponentType.RadioButton,
        ...COMMON_ATTRIBUTES,
        styleHandlers: {},
        name: "select selection mode radio",
        input: {
            value: {
                type: "handler",
                value: /* js */ ` 
                const selectedComponens =  GetVar( "selectedComponents")||[];
                const selectedComponent = selectedComponens[0];
                const currentComponent = GetComponent(selectedComponent, GetVar("currentEditingApplication").uuid)
                const currentSelectionMode = currentComponent.input?.selectionMode?.value || 'single';
                const options = 
                    [
                    {
                    label: "Single",
                    value: "single",
                    }, 
                    {
                    label: "Multiple",
                    value: "multiple"
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