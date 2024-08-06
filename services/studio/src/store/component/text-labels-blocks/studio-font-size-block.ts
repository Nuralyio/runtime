import { ComponentType } from "../interface";
import { COMMON_ATTRIBUTES } from "../helper/common_attributes";
export default [
    {
        uuid: "font_size_vertical_container",
        applicationId: "1",
        name: "Left panel",
        component_type: ComponentType.VerticalContainer,
        styleHandlers: {},
        input: {
            direction: "vertical",
        },

        ...COMMON_ATTRIBUTES,
        style: {
            width: "250px",
        },
        childrenIds: ["font_size_block"],
    },
    {
        uuid: "font_size_block",
        applicationId: "1",
        name: "Left panel",
        component_type: ComponentType.VerticalContainer,
        styleHandlers: {},
        input: {
            direction: "vertical",
        },

        ...COMMON_ATTRIBUTES,
        style: {
            width: "250px",
        },
        childrenIds: ["text_label_font_size", "font_size_input_2"],
    },

    {
        uuid: "text_label_font_size",
        name: "text_label",
        component_type: ComponentType.TextLabel,
        parameters: {
            value: "Font Size",
        },

        event: {
            onClick:  /* js */ `
                console.log("Clicked 44" , Current);
            `
        },
        applicationId: "1",
        ...COMMON_ATTRIBUTES,
        inputHandlers: {
            value: `GetContextVar("text_label_value");`
        },

    },
    {
        uuid: "font_size_input_2",
        name: "name",
        applicationId: "1",
        component_type: ComponentType.NumberInput,
        styleHandlers: {},
        parameters: {
            value: "22px",
        },
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
                        console.log(selectedComponens);
                        if( selectedComponens.length) {
                            const selectedComponent = selectedComponens[0];
                            const currentComponent = GetComponent(selectedComponent, GetVar("currentEditingApplication").uuid)
                            updateStyle(currentComponent, "fontSize", EventData.value+EventData.unity);
                        
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
                const fontSize =currentComponent.style['fontSize']?.split('')
                if(fontSize) 
                    {
                        let unity='';
                        let value='';
                        fontSize.forEach((char)=>
                            {
                            if(char>='0' && char<='9')
                                value+=char 
                            else 
                            unity+=char
                           }
                        );
                        [+value,unity]
                    }
                    else 
                       [0,'px']
            }

        }catch(e){
            console.log(e);
        }
            `
            }
        }
    },

]