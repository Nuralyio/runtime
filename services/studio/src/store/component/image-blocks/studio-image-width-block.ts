import { ComponentType } from "../interface";
import { COMMON_ATTRIBUTES } from "../helper/common_attributes";
export default [
    {
        uuid: "image_width_vertical_container",
        applicationId: "1",
        name: "image width vertical container",
        component_type: ComponentType.VerticalContainer,
        styleHandlers: {},

        ...COMMON_ATTRIBUTES,
        style: {
            width: "250px",
        },
        childrenIds: ["image_width_block"],
    },
    {
        uuid: "image_width_block",
        applicationId: "1",
        name: "Image width block",
        component_type: ComponentType.VerticalContainer,
        styleHandlers: {},
        ...COMMON_ATTRIBUTES,
        style: {
            width: "250px",
            display:'flex',
            'flex-direction':'column'
        },
        childrenIds: ["image_width", "image_width_input"],
    },

    {
        uuid: "image_width",
        name: "image width",
        component_type: ComponentType.TextLabel,
        applicationId: "1",
        ...COMMON_ATTRIBUTES,
        input: {
            value: {
                type: 'handler',
                value: /* js */`
                const label ='Width';
                label;
            `
            }
        },
      
    },
    {
        uuid: "image_width_input",
        name: "name",
        applicationId: "1",
        component_type: ComponentType.NumberInput,
        styleHandlers: {},
        ...COMMON_ATTRIBUTES,
        style: {
            width: "20px",
        },
        event: {
            valueChange: {
                type: "handler",
                value: /* js */ `
                    try{
                        const selectedComponens =  GetVar( "selectedComponents")||[];
                        if( selectedComponens.length) {
                            const selectedComponent = selectedComponens[0];
                            const currentComponent = GetComponent(selectedComponent, GetVar("currentEditingApplication").uuid)
                            console.log('eventdata ',EventData.value)
                            updateInput(currentComponent, "width", "string",EventData.value);
                        }
                    }catch(error){
                        console.log(error);
                    }
                    
  `
            }
        },
        input: {
            value: {
                type: 'handler',
                value: /* js */`
            try{
            const selectedComponens =  GetVar( "selectedComponents")||[];
            if( selectedComponens.length) {
                const selectedComponent = selectedComponens[0];
                const currentComponent = GetComponent(selectedComponent, GetVar("currentEditingApplication").uuid)
                const imageWidth = currentComponent.input?.width?.value??''
                const unity="px";
                [imageWidth,unity];
            }

        }catch(e){
            console.log(e);
        }
            `
            }
        }
    },

]