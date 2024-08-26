import { ComponentType } from "../interface";
import { COMMON_ATTRIBUTES } from "../helper/common_attributes";
export default [
    {
        uuid: "font_style_block",
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
        childrenIds: ["text_label_font_style", "font_style_values_block"],
    },
    {
        uuid: "text_label_font_style",
        name: "text_label",
        component_type: ComponentType.TextLabel,
        applicationId: "1",
        ...COMMON_ATTRIBUTES,
        input: {
            value: {
                type: 'handler',
                value: /* js */`
               const label ='Font style';
               label;
            `
            }
        },
    },
    {
        uuid: "font_style_values_block",
        applicationId: "1",
        name: "Left panel",
        component_type: ComponentType.VerticalContainer,
        styleHandlers: {},
        input: {
            direction: "vertical",
        },

        ...COMMON_ATTRIBUTES,
        style: {
            width: "150px",
            display: 'flex',
            gap: "10px"
        },
        childrenIds: ["font_style_content"],
    },
    {
        uuid: "font_style_content",
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
                let defaultFontStyle = currentComponent.style['font-style'] ||'normal';
                const options =[{value:'normal',icon: "font-awesome"},
                                {value:'italic',icon: "italic"},
                                {value:'oblique',icon: "font-awesome"}]
                const radioType='button';
                const result =[options,defaultFontStyle,radioType];
                result;           
                `
            }
        },
        event: {
            changed: /* js */ `
           try{
                const selectedComponens =  GetVar( "selectedComponents")||[];
                if( selectedComponens.length) {
                    const selectedComponent = selectedComponens[0];
                    const currentComponent = GetComponent(selectedComponent, GetVar("currentEditingApplication").uuid)
                    const fontStyleValue = EventData.value?EventData.value:'normal'
                    updateStyle(currentComponent, "font-style", fontStyleValue);
                }
            }catch(error){
                console.log(error);
            }
            
      `
        },
    },
] 
