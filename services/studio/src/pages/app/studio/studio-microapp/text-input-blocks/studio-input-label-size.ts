import { ComponentType } from "$store/component/interface.ts";
import { COMMON_ATTRIBUTES } from "../helper/common_attributes.ts";
export default [
    {
        uuid: "input_label_font_size_vertical_container",
        applicationId: "1",
        name: "Left panel",
        component_type: ComponentType.VerticalContainer,
        ...COMMON_ATTRIBUTES,
        style: {
            width: "330px",
            display:'flex',
            'justify-content':'space-between',
            'align-items':'center',
            'margin-top': '10px',
        },
        childrenIds: ["input_label_font_size_block","input_label_size_handler_block"],
    },
    {
        uuid: "input_label_font_size_block",
        applicationId: "1",
        name: "Left panel",
        component_type: ComponentType.VerticalContainer,
        ...COMMON_ATTRIBUTES,
        style: {
            display:'flex',
            'justify-content':'space-between',
            'align-items':'center'
        },
        childrenIds: ["text_label_label_font_size", "font_size_input"],
    },

    {
        uuid: "text_label_label_font_size",
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
                const label ='Label size';
                return label;
            `
            }
        },
      
    },
    {
        uuid: "font_size_input",
        name: "name",
        applicationId: "1",
        component_type: ComponentType.NumberInput,
        parameters: {
            value: "22px",
        },
        ...COMMON_ATTRIBUTES,
        style: {
            width: "120px",
            size:'small',
        },
        event: {
            valueChange:  /* js */ `
                    try{
                        const selectedComponens =  GetVar( "selectedComponents")||[];
                        if( selectedComponens.length) {
                            const selectedComponent = selectedComponens[0];
                            const currentComponent = GetComponent(selectedComponent, GetVar("currentEditingApplication").uuid)
                            const unity= EventData.unity ||"px"
                            updateStyle(currentComponent, "--hybrid-input-label-font-size", EventData.value+unity);
                        
                        }
                    }catch(error){
                        console.log(error);
                    }                 
  `
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
                const fontSize =currentComponent?.style && currentComponent.style['--hybrid-input-label-font-size']?.split('')
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
                        return [+value,unity]
                    }
                    else 
                       return [0,'px']
            }

        }catch(e){
            console.log(e);
        }
            `
            },
            state:{
                type:'handler',
                value:/* js */`
                try{
                    const selectedComponens =  GetVar( "selectedComponents")||[];
                    if(selectedComponens.length) {
                        const selectedComponent = selectedComponens[0];
                        const currentComponent = GetComponent(selectedComponent, GetVar("currentEditingApplication").uuid)
                        let state='enabled';
                        if(currentComponent.styleHandlers && currentComponent.styleHandlers['--hybrid-input-label-font-size']){
                         state='disabled'
                        }
                        return state
                    }
        
                }catch(e){
                    console.log(e);
                } 
                
                `
            }
        }
    },
    {
        uuid: "input_label_size_handler_block",
        applicationId: "1",
        name: "input label size handler block",
        component_type: ComponentType.VerticalContainer,
        ...COMMON_ATTRIBUTES,
        style: {
            width: "50px",
            display:'flex',
            'justify-content':'space-between',
        }, 
        childrenIds: ["input_label_size_handler"],
    },
    {
        uuid: "input_label_size_handler",
        applicationId: "1",
        component_type: ComponentType.Event,
        ...COMMON_ATTRIBUTES,
        styleHandlers: {},
        name: "input label size handler",
        style: {
                display:'block',
        },
        input: { 
            value: {
                type: 'handler',
                value: /* js */`
                const parameter ='labelSize';
                let labelSizeHandler =''
                try{
                    const selectedComponens =  GetVar( "selectedComponents")||[];
                    if( selectedComponens.length) {
                    const selectedComponent = selectedComponens[0];
                    const currentComponent = GetComponent(selectedComponent, GetVar("currentEditingApplication").uuid)    
                    labelSizeHandler= currentComponent?.styleHandlers && currentComponent?.styleHandlers['--hybrid-input-label-font-size'] || ''  
                    }
                }catch(error){
                    console.log(error);
                }
                return [parameter,labelSizeHandler];
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
                    updateStyleHandlers(currentComponent,'--hybrid-input-label-font-size',EventData.value)
                }
            }catch(error){
                console.log(error);
            }
      `
        },
    },

]