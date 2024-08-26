import { ComponentType } from "../interface";
import { COMMON_ATTRIBUTES } from "../helper/common_attributes";
export default [
    {
        uuid: "text_decoration_block",
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
            display: 'flex',
            'flex-direction': 'column',
            "margin-top": "10px"
        },
        childrenIds: ["text_label_text_decoration", "text_decoration_values_block"],
    },
    {
        uuid: "text_label_text_decoration",
        name: "text_label",
        component_type: ComponentType.TextLabel,
        parameters: {
            value: "Text decoration",
        },
        applicationId: "1",
        ...COMMON_ATTRIBUTES,
        input: {
            value: {
                type: 'handler',
                value: /* js */`
               const label ='Text decoration';
               label;
            `
            }
        },
        style:{
            display:true
        }
    },
    {
        uuid: "text_decoration_values_block",
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
            display: 'flex',
            gap: "10px"
        },
        childrenIds: ["text_decoration_content"],
    },
    {
        uuid: "text_decoration_content",
        name: "name",
        applicationId: "1",
        component_type: ComponentType.RadioButton,
        styleHandlers: {},
        ...COMMON_ATTRIBUTES,
        input: {
            value: {
                type: "handler",
                value: /* js */ `
                const selectedComponens =  GetVar( "selectedComponents")||[];
                const selectedComponent = selectedComponens[0];
                const currentComponent = GetComponent(selectedComponent, GetVar("currentEditingApplication").uuid)
                const defaultTextDecoration = currentComponent.style['text-decoration'] ||'none';
                const options =[{value:'overline',icon: "font-awesome"},
                                {value:'line-through',icon: "strikethrough"},
                                {value:'underline',icon: "underline"},
                                {value:'underline overline',icon: "grip-lines"},
                                {value:'none',icon: "xmark"}]


                const radioType='button';
                const result =[options,defaultTextDecoration,radioType];
                result;           
                `
            }
        },
        event: {
            changed: /* js */ `
           try{
                const selectedComponens =  GetVar( "selectedComponents")||[];
                if(selectedComponens.length) {
                    const selectedComponent = selectedComponens[0];
                    const currentComponent = GetComponent(selectedComponent, GetVar("currentEditingApplication").uuid)
                    const textDecorationValue = EventData.value?EventData.value:'none'
                    updateStyle(currentComponent, "text-decoration", textDecorationValue);
                }
            }catch(error){
                console.log(error);
            }   
      `
        },

    }
]