import { ComponentType } from "../interface";
import { COMMON_ATTRIBUTES } from "../helper/common_attributes";
export default [
    {
        uuid: "font_weight_block",
        applicationId: "1",
        name: "label font weight block",
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
            'margin-top': '10px',
        },
        childrenIds: ["text_label_font_weight", "font_weight_content"],
    },
    {
        uuid: "text_label_font_weight",
        name: "label font weight",
        component_type: ComponentType.TextLabel,
        
        applicationId: "1",
        ...COMMON_ATTRIBUTES,
        input: {
            value: {
                type: 'handler',
                value: /* js */`
               const label ='Font weight';
               label;
            `
            }
        },
    },
    {
        uuid: "font_weight_content",
        applicationId: "1",
        component_type: ComponentType.RadioButton,
        ...COMMON_ATTRIBUTES,
        styleHandlers: {},
        name: "label font weight",
        
        style: {
           
                display:'block',
                width: "350px",
            
        },
        input: {
            value: {
                type: "handler",
                value: /* js */ `
                const selectedComponens =  GetVar( "selectedComponents")||[];
                const selectedComponent = selectedComponens[0];
                const currentComponent = GetComponent(selectedComponent, GetVar("currentEditingApplication").uuid)
                let defaultFontWeight = currentComponent.style['font-weight'] ||'normal';
                const options =[{value:'normal',icon: "font-awesome"},
                                {value:'bold',icon: "bold"},
                                {value:'900',icon: "font-awesome"}]
                const radioType='button';
                const result =[options,defaultFontWeight,radioType];
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
                    const fontWeightValue = EventData.value?EventData.value:'normal'
                    updateStyle(currentComponent, "font-weight", fontWeightValue);
                }
            }catch(error){
                console.log(error);
            }
            
      `
        },
    },
] 
