import { ComponentType } from "../interface";
import { COMMON_ATTRIBUTES } from "../helper/common_attributes";

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

        childrenIds: ["input_size_label", "input_size_radio"],
    },
    
    {
        uuid: "input_size_label",
        name: "input size label",
        component_type: ComponentType.TextLabel,
        applicationId: "1",
        ...COMMON_ATTRIBUTES,
        input: {
            value: {
                type: 'handler',
                value: /* js */`
               const label ='Size';
               label;
            `
            }
        },
        style: {

        }
    },
    {
        uuid: "input_size_radio",
        applicationId: "1",
        component_type: ComponentType.RadioButton,
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
                const currentSize = currentComponent.style['size'] || 'medium'
                const options = 
                    [
                        {
                            value: "small",
                            icon:'font-awesome'
                        },
                        {
                            value: "medium",
                            icon:'font-awesome'
                        },
                        {
                            value: "large",
                            icon:'font-awesome'
                        }
            ]   
            const radioType ='button'
            const result = [options,currentSize,radioType];
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