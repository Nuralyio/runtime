import { ComponentType } from "../interface";
import { COMMON_ATTRIBUTES } from "../common_attributes";
export default [
    {
        uuid: "input_size_block",
        applicationId: "1",
        name: "input size block",
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

        childrenIds: ["input_size_label", "input_size_select"],
    },
    
    {
        uuid: "input_size_label",
        name: "input size label",
        component_type: ComponentType.TextLabel,
        parameters: {
            value: "Size",
        },
        applicationId: "1",
        ...COMMON_ATTRIBUTES,
        style: {

        }
    },
    {
        uuid: "input_size_select",
        applicationId: "1",
        component_type: ComponentType.Select,
        ...COMMON_ATTRIBUTES,
        styleHandlers: {},
        name: "input size select",
        input: {
            value: {
                type: "handler",
                value: /* js */ ` 
                const selectedComponens =  GetVar( "selectedComponents")||[];
                const selectedComponent = selectedComponens[0];
                const currentComponent = GetComponent(selectedComponent, GetVar("currentEditingApplication").uuid)
                let currentSize = currentComponent.parameters?.size || 'Medium';
                const options = 
                    [
                    {
                    label: "Large",
                    value: "large",
                    }, 
                    {
                    label: "Medium",
                    value: "medium"
                   },
                    {
                     label: "Small",
                     value: "small"
                   }
            ]   
            const result = [options,[currentSize]];
            result;
                `
            },
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
                    const sizeValue = EventData.value;
                    updateStyle(currentComponent,'size',sizeValue)
                }
            }catch(error){
                console.log(error);
            }  
      `
        },
    }

]