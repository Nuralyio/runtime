import { ComponentType } from "$store/component/interface.ts";
import { COMMON_ATTRIBUTES } from "../helper/common_attributes.ts";
export default [
    {
        uuid: "image_height_vertical_container",
        applicationId: "1",
        name: "image height vertical container",
        component_type: ComponentType.VerticalContainer,
        ...COMMON_ATTRIBUTES,
        style: {
            width: "330px",
            display:'flex',
            'justify-content':'space-between',
            'align-items':'center'
        },
        childrenIds: ["image_height_block","image_height_handler_block"],
    },
    {
        uuid: "image_height_block",
        applicationId: "1",
        name: "Image height block",
        component_type: ComponentType.VerticalContainer,
        ...COMMON_ATTRIBUTES,
        style: {
            display:'flex',
            'align-items':'center',
            'justify-content':'space-between'

        },
        childrenIds: ["image_height", "image_height_input"],
    },

    {
        uuid: "image_height",
        name: "image height",
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
                const label ='Height';
              return label;
            `
            }
        },
      
    },
    {
        uuid: "image_height_input",
        name: "name",
        applicationId: "1",
        component_type: ComponentType.NumberInput,
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
                            updateStyle(currentComponent, "height",EventData.value+'px');

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
                const imageHeight = currentComponent?.style&&currentComponent.style['height']||0;
                return imageHeight;
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
                    if( selectedComponens.length) {
                        const selectedComponent = selectedComponens[0];
                        const currentComponent = GetComponent(selectedComponent, GetVar("currentEditingApplication").uuid)
                        let state='enabled';
                        if(currentComponent.styleHandlers && currentComponent.styleHandlers['height']){
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
        uuid: "image_height_handler_block",
        applicationId: "1",
        name: "image height handler block",
        component_type: ComponentType.VerticalContainer,
        ...COMMON_ATTRIBUTES,
        style: {
            width: "50px",
            'margin-top': '10px',
            display:'flex',
            'justify-content':'space-between',
        }, 
        childrenIds: ["image_height_handler"],
    },
    {
        uuid: "image_height_handler",
        applicationId: "1",
        component_type: ComponentType.Event,
        ...COMMON_ATTRIBUTES,
        styleHandlers: {},
        name: "image height handler",
        style: {
                display:'block',
        },
        input: { 
            value: {
                type: 'handler',
                value: /* js */`
                const parameter ='imageHeight';
                let imageHeightHandler =''
                try{
                    const selectedComponens =  GetVar( "selectedComponents")||[];
                    if( selectedComponens.length) {
                    const selectedComponent = selectedComponens[0];
                    const currentComponent = GetComponent(selectedComponent, GetVar("currentEditingApplication").uuid)    
                    imageHeightHandler= currentComponent?.styleHandlers && currentComponent?.styleHandlers['height'] || ''  

                    }
                }catch(error){
                    console.log(error);
                }
                return [parameter,imageHeightHandler];
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
                    updateStyleHandlers(currentComponent,'height',EventData.value)

                }
            }catch(error){
                console.log(error);
            }
      `
        },
    },

]