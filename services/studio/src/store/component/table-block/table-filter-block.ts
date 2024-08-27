import { ComponentType } from "../interface";
import { COMMON_ATTRIBUTES } from "../helper/common_attributes";
export default [
    {
        uuid: "table_filter_block",
        applicationId: "1",
        name: "table filter block",
        component_type: ComponentType.VerticalContainer,
        ...COMMON_ATTRIBUTES,
        style: {
            display:'flex',
            'flex-direction':'column'
        },

        childrenIds: ["table_filter_label", "table_filter_radio"],
    },
    
    {
        uuid: "table_filter_label",
        name: "table filter label",
        component_type: ComponentType.TextLabel,
        applicationId: "1",
        ...COMMON_ATTRIBUTES,
        input:{
            value:{
                type:'handler',
                value:/* js */`
                const filterLabel='Filter';
                filterLabel;
                
                `
            }
        },
        style: {

        }
    },
    {
        uuid: "table_filter_radio",
        applicationId: "1",
        component_type: ComponentType.RadioButton,
        ...COMMON_ATTRIBUTES,
        styleHandlers: {},
        name: "table filter radio",
        input: {
            value: {
                type: "handler",
                value: /* js */ ` 
                const selectedComponens =  GetVar( "selectedComponents")||[];
                const selectedComponent = selectedComponens[0];
                const currentComponent = GetComponent(selectedComponent, GetVar("currentEditingApplication").uuid)
                const currentFilter = currentComponent.input?.filter?.value || 'none';
                const options = 
                    [
                    {
                    icon: "filter",
                    value: "filter",
                    }, 
                    {
                    icon: "xmark",
                    value: "none"
                   }
            ]   
            const radioType ='button'
            const result = [options,currentFilter,radioType];
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
                    const filterValue = EventData.value;
                    updateInput(currentComponent,'filter','string',EventData.value)
                }
            }catch(error){
                console.log(error);
            }  
      `
        },
    }

]