import { ComponentType } from "../interface";
import { COMMON_ATTRIBUTES } from "../helper/common_attributes";
export default [
    {
        uuid: "text_vertical_alignement_block",
        applicationId: "1",
        name: "text vertical alignement block",
        component_type: ComponentType.VerticalContainer,
        ...COMMON_ATTRIBUTES,
        style: {

        },

        childrenIds: ["vertical_alignement_label_container", "vertical_alignement_content_container","vertical_alignement_handler_block"],
    },
    {
        uuid: "vertical_alignement_label_container",
        applicationId: "1",
        name: "Left panel",
        component_type: ComponentType.VerticalContainer,
        ...COMMON_ATTRIBUTES,
        style: {
            width: "250px",
        },
        childrenIds: ["text_label_vertical_alignement"],
    },
    {
        uuid: "vertical_alignement_content_container",
        applicationId: "1",
        name: "vertical alignement content container",
        component_type: ComponentType.VerticalContainer,
        ...COMMON_ATTRIBUTES,
        style: {
            width: "280px",
            display: 'flex',
            'justify-content': 'space-between'
        },
        childrenIds: ["text_vertical_align_content"],
    },
    {
        uuid: "text_label_vertical_alignement",
        name: "text_label vertical alignement",
        component_type: ComponentType.TextLabel,
        applicationId: "1",
        ...COMMON_ATTRIBUTES,
        input: {
            value: {
                type: 'handler',
                value: /* js */`
               const label ='Vertical alignement';
               label;
            `
            }
        },
    },
    {
        uuid: "text_vertical_align_content",
        name: "name",
        applicationId: "1",
        component_type: ComponentType.RadioButton,
        ...COMMON_ATTRIBUTES,
        input: {
            value: {
                type: "handler",
                value: /* js */ `
                const selectedComponens =  GetVar( "selectedComponents")||[];
                const selectedComponent = selectedComponens[0];
                const currentComponent = GetComponent(selectedComponent, GetVar("currentEditingApplication").uuid)
                let defaultVerticalAlign='';
                let isDisabled = false;
                if(currentComponent.styleHandlers && currentComponent?.styleHandlers['align-items']) {
                    isDisabled = true
                }
                else 
                defaultVerticalAlign = currentComponent.style['align-items'] ||'start';
                const options =[
                                {value:'start',icon: "arrow-up",disabled:isDisabled},
                                {value:'end',icon: "arrow-down",disabled:isDisabled},
                                {value:'center',icon:'align-center',disabled:isDisabled}
                              ]
                const radioType='button';
                const result =[options,defaultVerticalAlign,radioType];
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
                    const currentComponentDisplay = currentComponent.style['display'];
                    const verticalAlignValue = EventData.value;
                    if(currentComponentDisplay!='flex')
                    updateStyle(currentComponent, "display", 'flex');
                
                    updateStyle(currentComponent, "align-items", verticalAlignValue);
                }
            }catch(error){
                console.log(error);
            }  
      `
        },
    },
    {
        uuid: "vertical_alignement_handler_block",
        applicationId: "1",
        name: "vertical alignement handler block",
        component_type: ComponentType.VerticalContainer,
        ...COMMON_ATTRIBUTES,
        style: {
            width: "220px",
            'margin-top': '10px',
            display:'flex',
            'justify-content':'space-between',
        },
        
        childrenIds: ["vertical_alignement_handler"],
    },
    {
        uuid: "vertical_alignement_handler",
        applicationId: "1",
        component_type: ComponentType.Event,
        ...COMMON_ATTRIBUTES,
        styleHandlers: {},
        name: "vertical alignement handler",
        style: {
                display:'block',
                width: "250px", 
        },
        input: { 
            value: {
                type: 'handler',
                value: /* js */`
                const parameter ='verticalAlignement';
                let verticalAlignementHandler=''
                try{
                    const selectedComponens =  GetVar( "selectedComponents")||[];
                    if( selectedComponens.length) {
                    const selectedComponent = selectedComponens[0];
                    const currentComponent = GetComponent(selectedComponent, GetVar("currentEditingApplication").uuid)    
                    verticalAlignementHandler= currentComponent?.styleHandlers && currentComponent?.styleHandlers['align-items'] || ''  
                    }
                }catch(error){
                    console.log(error);
                }
                [parameter,verticalAlignementHandler];
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
                    const currentComponentDisplay = currentComponent?.style['display'];
                    
                    if(currentComponentDisplay!='flex')
                     updateStyle(currentComponent, "display", 'flex');
                    
                    updateStyleHandlers(currentComponent,'align-items',EventData.value)
                }
            }catch(error){
                console.log(error);
            }
      `
        },
    },
] 
