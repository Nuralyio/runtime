import { ComponentType } from "$store/component/interface.ts";
import { COMMON_ATTRIBUTES } from "../helper/common_attributes.ts";
export default [
    {
        uuid: "input_helper_font_size_vertical_container",
        applicationId: "1",
        name: "Left panel",
        component_type: ComponentType.VerticalContainer,
        ...COMMON_ATTRIBUTES,
        style: {
            
            display:'flex',
            'justify-content':'space-between',
            'align-items':'center',
            'margin-top': '10px',
        },
        childrenIds: ["input_helper_font_size_block","input_helper_size_handler_block"],
    },
    {
        uuid: "input_helper_font_size_block",
        applicationId: "1",
        name: "Left panel",
        component_type: ComponentType.VerticalContainer,
        ...COMMON_ATTRIBUTES,
        style: {
            display:'flex',
            'justify-content':'space-between',
            'align-items':'center'
        },
        childrenIds: ["text_label_helper_font_size", "font_size_helper_input"],
    },

    {
        uuid: "text_label_helper_font_size",
        name: "text_label",
        component_type: ComponentType.TextLabel,
        applicationId: "1",
        ...COMMON_ATTRIBUTES,
        style:{
            width:'90px'
        },
        input: {
            value: {
                type: 'handler',
                value: /* js */`
                const label ='Helper size';
                return label;
            `
            }
        },
      
    },
    {
        uuid: "font_size_helper_input",
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
            valueChange: /* js */ `
                    try{
                        const selectedComponens =  GetVar( "selectedComponents")||[];
                        if( selectedComponens.length) {
                            const selectedComponent = selectedComponens[0];
                            const currentComponent = GetComponent(selectedComponent, GetVar("currentEditingApplication").uuid)
                            const unity = EventData.unity || 'px'
                            updateStyle(currentComponent, "--hybrid-input-helper-text-font-size", EventData.value+unity);
                        
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
                const fontSize =currentComponent?.style && currentComponent.style['--hybrid-input-helper-text-font-size']?.split('')
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
                        if(currentComponent.styleHandlers && currentComponent.styleHandlers['--hybrid-input-helper-text-font-size']){
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
        uuid: "input_helper_size_handler_block",
        applicationId: "1",
        name: "input helper size handler block",
        component_type: ComponentType.VerticalContainer,
        ...COMMON_ATTRIBUTES,
        style: {
            width: "50px",
            display:'flex',
            'justify-content':'space-between',
        }, 
        childrenIds: ["input_helper_size_handler"],
    },
    {
        uuid: "input_helper_size_handler",
        applicationId: "1",
        component_type: ComponentType.Event,
        ...COMMON_ATTRIBUTES,
        styleHandlers: {},
        name: "input helper size handler",
        style: {
                display:'block',
        },
        input: { 
            value: {
                type: 'handler',
                value: /* js */`
                const parameter ='helperSize';
                let helperSizeHandler =''
                try{
                    const selectedComponens =  GetVar( "selectedComponents")||[];
                    if( selectedComponens.length) {
                    const selectedComponent = selectedComponens[0];
                    const currentComponent = GetComponent(selectedComponent, GetVar("currentEditingApplication").uuid)    
                    helperSizeHandler= currentComponent?.styleHandlers && currentComponent?.styleHandlers['--hybrid-input-helper-text-font-size'] || ''  
                    }
                }catch(error){
                    console.log(error);
                }
                return [parameter,helperSizeHandler];
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
                    updateStyleHandlers(currentComponent,'--hybrid-input-helper-text-font-size',EventData.value)
                }
            }catch(error){
                console.log(error);
            }
      `
        },
    },

]