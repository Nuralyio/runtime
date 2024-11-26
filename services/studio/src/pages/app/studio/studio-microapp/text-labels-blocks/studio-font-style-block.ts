import { ComponentType } from "$store/component/interface.ts";
import { COMMON_ATTRIBUTES } from "../helper/common_attributes.ts";
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
            width: "330px",
            display: 'flex',
            "justify-content":'space-between',
            "align-items":'center',
            "margin-top": "10px"
        },
        childrenIds: ["label_fontstyle_radio_block","font_style_handler_block"],
    },
    {
        uuid: "label_fontstyle_radio_block",
        applicationId: "1",
        name: "label fontstyle radio block",
        component_type: ComponentType.VerticalContainer,
        ...COMMON_ATTRIBUTES,
        style: {
            display:'flex',
            'align-items':'center',
            'justify-content':'space-between'
        },
        childrenIds: ["text_label_font_style", "font_style_values_block"],
    },
    {
        uuid: "text_label_font_style",
        name: "text_label",
        component_type: ComponentType.TextLabel,
        applicationId: "1",
        ...COMMON_ATTRIBUTES,
        style:{
         'font-size':'14px',
         width:'90px'
        },
        input: {
            value: {
                type: 'handler',
                value: /* js */`
               const label ='Font style';
             return label;
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
        ...COMMON_ATTRIBUTES,
        style:{
            '--hybrid-button-height':'30px',
            '--hybrid-button-width':'50px',
            '--hybrid-button-font-size':'12px'
        },
        input: {
            value: {
                type: "handler",
                value: /* js */ `
                const selectedComponens =  GetVar( "selectedComponents")||[];
                const selectedComponent = selectedComponens[0];
                const currentComponent = GetComponent(selectedComponent, GetVar("currentEditingApplication").uuid)
                let isDisabled = false;
                let defaultFontStyle =''
                if(currentComponent.styleHandlers && currentComponent?.styleHandlers['font-style']) {
                    isDisabled = true
                }
                else
                defaultFontStyle = currentComponent.style['font-style'] ||'normal';
                const options =[{value:'normal',label: "Normal",disabled:isDisabled},
                                {value:'italic',label: "Italic",disabled:isDisabled},
                                {value:'oblique',label: "Oblique",disabled:isDisabled}]
                const radioType='button';
                const result =[options,defaultFontStyle,radioType];
                return  result;           
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
    {
        uuid: "font_style_handler_block",
        applicationId: "1",
        name: "font style handler block",
        component_type: ComponentType.VerticalContainer,
        ...COMMON_ATTRIBUTES,
        style: {
            width: "50px",
            display:'flex',
            'justify-content':'space-between',
        },
        
        childrenIds: ["font_style_handler"],
    },
    {
        uuid: "font_style_handler",
        applicationId: "1",
        component_type: ComponentType.Event,
        ...COMMON_ATTRIBUTES,
        styleHandlers: {},
        name: "font style handler",
        style: {
                display:'block',
        },
        input: { 
            value: {
                type: 'handler',
                value: /* js */`
                const parameter ='style';
                let fontStyleHandler=''
                try{
                    const selectedComponens =  GetVar( "selectedComponents")||[];
                    if( selectedComponens.length) {
                    const selectedComponent = selectedComponens[0];
                    const currentComponent = GetComponent(selectedComponent, GetVar("currentEditingApplication").uuid)    
                    fontStyleHandler= currentComponent?.styleHandlers && currentComponent?.styleHandlers['font-style'] || ''  
                    }
                }catch(error){
                    console.log(error);
                }
                return [parameter,fontStyleHandler];
            `
            }
        },
        
        event: {
            codeChange: /* js */ `
            try{
                const selectedComponens =  GetVar( "selectedComponents")||[];
                if(selectedComponens.length) {
                    const selectedComponent = selectedComponens[0];
                    let currentComponent = GetComponent(selectedComponent, GetVar("currentEditingApplication").uuid)
                    updateStyleHandlers(currentComponent,'font-style',EventData.value)
                }
            }catch(error){
                console.log(error);
            }
      `
        },
    },
] 
