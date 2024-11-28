import { ComponentType } from "$store/component/interface.ts";
import { COMMON_ATTRIBUTES } from "../helper/common_attributes.ts";
export default [
    {
        uuid: "height_vertical_container",
        applicationId: "1",
        name: "height vertical container",
        component_type: ComponentType.VerticalContainer,
        ...COMMON_ATTRIBUTES,
        style: {
            
            "margin-top":'10px',
            'align-items':'center',
            'justify-content':'space-between',
        },
        childrenIds: ["height_block","auto_height_block","height_handler_block"],
    },
    {
        uuid: "height_block",
        applicationId: "1",
        name: "height block",
        component_type: ComponentType.VerticalContainer,
        ...COMMON_ATTRIBUTES,
        style: {
            display:'flex',
            'align-items':'center',
            'justify-content':'space-between',
        },
        childrenIds: ["height_label", "height_container"],
    },
    {
        uuid: "height_container",
        name: "height container",
        component_type: ComponentType.VerticalContainer,
        applicationId: "1",
        ...COMMON_ATTRIBUTES,
        style:{
            display:'flex',
            "align-items":'center'
        },
        childrenIds: ["height_input","auto_height_checkbox"],

    },

    {
        uuid: "height_label",
        name: "height label",
        component_type: ComponentType.TextLabel,
        applicationId: "1",
        ...COMMON_ATTRIBUTES,
        style:{
        width:"90px"
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
        uuid: "height_input",
        name: "height input",
        applicationId: "1",
        component_type: ComponentType.NumberInput,
        ...COMMON_ATTRIBUTES,
        style: {
            display:'block',
            width: "120px",
            size:'small',
        },
        event: {
            valueChange: 
             /* js */ `
                    try{
                        const selectedComponens =  GetVar( "selectedComponents")||[];
                        if( selectedComponens.length) {
                            const selectedComponent = selectedComponens[0];
                            const currentComponent = GetComponent(selectedComponent, GetVar("currentEditingApplication").uuid)
                            updateStyle(currentComponent, "height",EventData.value+'px');
                        }
                    }catch(error){
                        console.log(error);
                    }         `
            
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
                const height = currentComponent?.style&&currentComponent.style['height']||0;
                return height;
                
            }

        }
         catch(e){
             console.log(e);
          }
            `
            },
            state: {
                type: 'handler',
                value: /* js */`
            try{
            const selectedComponens =  GetVar( "selectedComponents")||[];
            if( selectedComponens.length) {
                const selectedComponent = selectedComponens[0];
                const currentComponent = GetComponent(selectedComponent, GetVar("currentEditingApplication").uuid)
                let state ='enabled'
                if(currentComponent?.styleHandlers && currentComponent?.styleHandlers['height']){
                  state ='disabled'
                }
                return state;  
            }

        }catch(e){
            console.log(e);
        }
            `
            }
        }
    },

    {
        uuid: "auto_height_checkbox",
        name: "auto height checkbox",
        applicationId: "1",
        component_type: ComponentType.Checkbox,
        ...COMMON_ATTRIBUTES,
        style: {
            
        },
        
        input: {
            label: {
                type: 'handler',
                value: /* js */`
              const checkboxLabel ='auto';
              return checkboxLabel;
            `
            },
            checked: {
                type: 'handler',
                value: /* js */`
            try{
            const selectedComponens =  GetVar( "selectedComponents")||[];
            if( selectedComponens.length) {
                const selectedComponent = selectedComponens[0];
                const currentComponent = GetComponent(selectedComponent, GetVar("currentEditingApplication").uuid)
                const autoHeightChecked = !currentComponent?.style?.height||currentComponent?.input?.height?.value =='auto'?'check':''
                return autoHeightChecked;  
            }

        }catch(e){
            console.log(e);
        }
            `
            },
            state:{
                type: 'handler',
                value: /* js */`
                try{
                    const selectedComponens =  GetVar( "selectedComponents")||[];
                    if(selectedComponens.length) {
                        const selectedComponent = selectedComponens[0];
                        const currentComponent = GetComponent(selectedComponent, GetVar("currentEditingApplication").uuid)
                        let state ='enabled';
                        if(currentComponent?.styleHandlers && currentComponent.styleHandlers['height']){
                            state ='disabled'
                        }
                        return state;  
                    }
        
                }catch(e){
                    console.log(e);
                }
                
                `
        }
        },
        event: {
            checkboxChanged:  /* js */ `
                try{
                    const selectedComponens =  GetVar( "selectedComponents")||[];
                    if( selectedComponens.length) {
                        const selectedComponent = selectedComponens[0];
                        const currentComponent = GetComponent(selectedComponent, GetVar("currentEditingApplication").uuid)
                        const autoHeight = EventData.value;
                        updateInput(currentComponent,'height','string',autoHeight?'auto':'');
                    }
                }catch(error){
                    console.log(error);
                }`
        },
    },
    {
        uuid: "height_handler_block",
        applicationId: "1",
        name: "height handler block",
        component_type: ComponentType.VerticalContainer,
        ...COMMON_ATTRIBUTES,
        style: {
            width: "50px",
            display:'flex',
            'justify-content':'space-between',
        },
        
        childrenIds: ["height_handler"],
    },
    {
        uuid: "height_handler",
        applicationId: "1",
        component_type: ComponentType.Event,
        ...COMMON_ATTRIBUTES,
        styleHandlers: {},
        name: "height handler",
        style: {
                display:'block',
        },
        input: { 
            value: {
                type: 'handler',
                value: /* js */`
                const parameter ='height';
                let heightHandler=''
                try{
                    const selectedComponens =  GetVar( "selectedComponents")||[];
                    if( selectedComponens.length) {
                    const selectedComponent = selectedComponens[0];
                    const currentComponent = GetComponent(selectedComponent, GetVar("currentEditingApplication").uuid)    
                    heightHandler = currentComponent?.styleHandlers && currentComponent?.styleHandlers['height'] || ''  
                    }
                }catch(error){
                    console.log(error);
                }
                return [parameter,heightHandler];
            `
            }
        },
        
        event: {
            codeChange: /* js */ `
            try{
                const selectedComponens =  GetVar( "selectedComponents")||[];
                if( selectedComponens.length) {
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