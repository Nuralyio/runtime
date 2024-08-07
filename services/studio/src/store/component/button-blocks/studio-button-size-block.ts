import { ComponentType } from "../interface";
import { COMMON_ATTRIBUTES } from "../helper/common_attributes";
export default [
    {
        uuid: "button_size_block",
        applicationId: "1",
        name: "button size block",
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

        childrenIds: ["button_size_label", "button_size_select"],
    },
    
    {
        uuid: "button_size_label",
        name: "button size label",
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
        uuid: "button_size_select",
        applicationId: "1",
        component_type: ComponentType.Select,
        ...COMMON_ATTRIBUTES,
        styleHandlers: {},
        name: "button size select",
        input: {
            value: {
                type: "handler",
                value: /* js */ ` 
                const selectedComponens =  GetVar( "selectedComponents")||[];
                const selectedComponent = selectedComponens[0];
                const currentComponent = GetComponent(selectedComponent, GetVar("currentEditingApplication").uuid)
                let currentSize;
                // need to find current button size and return default selected option 
                // in addition to all option list
                const options = 
                    [
                    {
                    label: "Large",
                    value: "large",
                    }, 
                    {
                    label: "Default",
                    value: "default"
                   },
                    {
                     label: "Small",
                     value: "small"
                   }
            ]   
            const result = [options,[]];
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
                    const sizeValue = EventData.value;
                    // update button size with new sizeValue
                }
            }catch(error){
                console.log(error);
            }  
      `
        },
    }

]