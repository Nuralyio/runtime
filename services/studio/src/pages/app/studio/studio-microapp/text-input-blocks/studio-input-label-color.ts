import { ComponentType } from "$store/component/interface.ts";
import { COMMON_ATTRIBUTES } from "../helper/common_attributes.ts";
export default [
    {
    uuid: "input_label_color_block",
    applicationId: "1",
    name: "input label color block",
    component_type: ComponentType.VerticalContainer,
    ...COMMON_ATTRIBUTES,
    style: {
        
        display: 'flex',
        'align-items':'center',
        'justify-content':'space-between',
        'margin-top': '10px',
    },
    childrenIds: ["label_input_block","input_label_color_handler_block"]
    },
    {
        uuid: "label_input_block",
        applicationId: "1",
        name: "label input block",
        component_type: ComponentType.VerticalContainer,
        ...COMMON_ATTRIBUTES,
        style: {
            display:'flex',
            'align-items':'center',
            'justify-content':'space-between'
        },
        childrenIds: ["input_label_color_label", "label_color_input"],
    },
    {
        uuid: "input_label_color_label",
        name: "input label color label",
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
                const label ='Label color';
                return label;`
            }
        },
    },
{
    uuid: "label_color_input",
    name: "name",
    applicationId: "1",
    component_type: ComponentType.ColorPicker,
    event: {
        valueChange: /* js */ `
       
       try{
            const selectedComponens =  GetVar( "selectedComponents")||[];
            if( selectedComponens.length) {
                const selectedComponent = selectedComponens[0];
                const currentComponent = GetComponent(selectedComponent, GetVar("currentEditingApplication").uuid)
                updateStyle(currentComponent, "--hybrid-input-label-color", EventData.value);
            
            }
        }catch(error){
            console.log(error);
        }
        
  `
    },
    ...COMMON_ATTRIBUTES,
   style:{
    width:"50px",
    display:'block'
   },
    input: {
        value: {
            type: "handler",
            value: /* js */`
                try{
                    const selectedComponens =  GetVar( "selectedComponents")||[];
                    if( selectedComponens.length) {
                        const selectedComponent = selectedComponens[0];
                        const currentComponent = GetComponent(selectedComponent, GetVar("currentEditingApplication").uuid)
                        if(currentComponent?.style)
                        return currentComponent.style['--hybrid-input-label-color'];
                    }

                }catch(e){
                    console.log(e);
                }
            `
        },
        state:{
            type:"handler",
            value:/* js */ `
            try{
                const selectedComponens =  GetVar( "selectedComponents")||[];
                if(selectedComponens.length) {
                    const selectedComponent = selectedComponens[0];
                    const currentComponent = GetComponent(selectedComponent, GetVar("currentEditingApplication").uuid)
                    let state='enabled';
                    if(currentComponent.styleHandlers && currentComponent.styleHandlers['--hybrid-input-label-color']){
                        state='disabled'
                    }
                    state;
                }

            }catch(e){
                console.log(e);
            }
            `
        }
    }
},
{
    uuid: "input_label_color_handler_block",
    applicationId: "1",
    name: "input label color handler block",
    component_type: ComponentType.VerticalContainer,
    ...COMMON_ATTRIBUTES,
    style: {
        width: "50px",
        display:'flex',
        'justify-content':'space-between',
    },
    
    childrenIds: ["input_label_color_handler"],
},
{
    uuid: "input_label_color_handler",
    applicationId: "1",
    component_type: ComponentType.Event,
    ...COMMON_ATTRIBUTES,
    styleHandlers: {},
    name: "label color handler",
    style: {
            display:'block',
    },
    input: { 
        value: {
            type: 'handler',
            value: /* js */`
            const parameter ='labelColor';
            let labelColorHandler=''
            try{
                const selectedComponens =  GetVar( "selectedComponents")||[];
                if( selectedComponens.length) {
                const selectedComponent = selectedComponens[0];
                const currentComponent = GetComponent(selectedComponent, GetVar("currentEditingApplication").uuid)    
                labelColorHandler=currentComponent?.styleHandlers && currentComponent?.styleHandlers['--hybrid-input-label-color'] || ''  
                }
            }catch(error){
                console.log(error);
            }
            return [parameter,labelColorHandler];
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
                updateStyleHandlers(currentComponent,'--hybrid-input-label-color',EventData.value)
            }
        }catch(error){
            console.log(error);
        }
  `
    },
},
] 
