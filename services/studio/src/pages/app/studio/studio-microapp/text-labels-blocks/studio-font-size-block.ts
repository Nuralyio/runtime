import { ComponentType } from "$store/component/interface.ts";
import { COMMON_ATTRIBUTES } from "../helper/common_attributes.ts";
export default [
    {
        uuid: "font_size_vertical_container",
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
        childrenIds: ["font_size_block","label_fontsize_handler_block"],
    },
    {
        uuid: "font_size_block",
        applicationId: "1",
        name: "Left panel",
        component_type: ComponentType.VerticalContainer,
        ...COMMON_ATTRIBUTES,
        style: {
            display:'flex',
            'justify-content':'space-between',
            'align-items':'center'
        },
        childrenIds: ["text_label_font_size", "font_size_input_2"],
    },

    {
        uuid: "text_label_font_size",
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
                const label ='Font size';
                return label;
            `
            }
        },
      
    },
    {
        uuid: "font_size_input_2",
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
            valueChange:  /* js */`
                    try{
                        const selectedComponens =  GetVar( "selectedComponents")||[];
                        console.log(selectedComponens);
                        if( selectedComponens.length) {
                            const selectedComponent = selectedComponens[0];
                            const currentComponent = GetComponent(selectedComponent, GetVar("currentEditingApplication").uuid)
                            const unity= EventData.unity || 'px'
                            updateStyle(currentComponent, "fontSize", EventData.value+unity);
                        
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
                const fontSize =currentComponent?.style && currentComponent.style['fontSize']?.split('')
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
                        if(currentComponent.styleHandlers && currentComponent.styleHandlers['fontSize']){
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
        uuid: "label_fontsize_handler_block",
        applicationId: "1",
        name: "label fontsize handler block",
        component_type: ComponentType.VerticalContainer,
        ...COMMON_ATTRIBUTES,
        style: {
            width: "50px",
            display:'flex',
            'justify-content':'space-between',
        }, 
        childrenIds: ["label_fontsize_handler"],
    },
    {
        uuid: "label_fontsize_handler",
        applicationId: "1",
        component_type: ComponentType.Event,
        ...COMMON_ATTRIBUTES,
        styleHandlers: {},
        name: "label font size handler",
        style: {
                display:'block',
        },
        input: { 
            value: {
                type: 'handler',
                value: /* js */`
                const parameter ='labelFontSize';
                let labelFontSizeHandler =''
                try{
                    const selectedComponens =  GetVar( "selectedComponents")||[];
                    if( selectedComponens.length) {
                    const selectedComponent = selectedComponens[0];
                    const currentComponent = GetComponent(selectedComponent, GetVar("currentEditingApplication").uuid)    
                    labelFontSizeHandler= currentComponent?.styleHandlers && currentComponent?.styleHandlers['fontSize'] || ''  
                    }
                }catch(error){
                    console.log(error);
                }
                return [parameter,labelFontSizeHandler];
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
                    updateStyleHandlers(currentComponent,'fontSize',EventData.value)
                }
            }catch(error){
                console.log(error);
            }
      `
        },
    },


]