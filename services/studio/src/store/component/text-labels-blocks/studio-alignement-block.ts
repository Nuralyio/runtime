import { ComponentType } from "../interface";
import { COMMON_ATTRIBUTES } from "../helper/common_attributes";
export default [
    {
        uuid: "text_alignement_block",
        applicationId: "1",
        name: "Left panel",
        component_type: ComponentType.VerticalContainer,
        ...COMMON_ATTRIBUTES,
        style: {

        },

        childrenIds: ["alignement_label_container", "alignement_content_container","horizontal_alignement_handler_block"],
    },
    {
        uuid: "alignement_label_container",
        applicationId: "1",
        name: "Left panel",
        component_type: ComponentType.VerticalContainer,
        ...COMMON_ATTRIBUTES,
        style: {
            width: "250px",
        },
        childrenIds: ["text_label_alignement"],
    },
    {
        uuid: "alignement_content_container",
        applicationId: "1",
        name: "Left panel",
        component_type: ComponentType.VerticalContainer,
        ...COMMON_ATTRIBUTES,
        style: {
            width: "280px",
            display: 'flex',
            'justify-content': 'space-between'
        },
        childrenIds: ["text-align-content"],
    },
    {
        uuid: "text_label_alignement",
        name: "text_label",
        component_type: ComponentType.TextLabel,
        applicationId: "1",
        ...COMMON_ATTRIBUTES,
        input: {
            value: {
                type: 'handler',
                value: /* js */`
               const label ='Horizontal alignement';
             return label;
            `
            }
        },
    },
    {
        uuid: "text-align-content",
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
                let defaultTextAlign='';
                let isDisabled = false;
                if(currentComponent.styleHandlers && currentComponent?.styleHandlers['justify-content']) {
                    isDisabled = true
                }
                else 
                defaultTextAlign = currentComponent.style['justify-content'] ||'start';

                const options =[{value:'start',icon: "align-left",disabled:isDisabled},
                                {value:'center',icon: "align-center",disabled:isDisabled},
                                 {value:'end',icon: "align-right",disabled:isDisabled},
                              ]
                const radioType='button';
                const result =[options,defaultTextAlign,radioType];
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
                    const currentComponentDisplay = currentComponent.style['display'];
                    const textAlignValue = EventData.value;
                    if(currentComponentDisplay!='flex')
                    updateStyle(currentComponent, "display", 'flex');
                
                    updateStyle(currentComponent, "justify-content", textAlignValue);
                }
            }catch(error){
                console.log(error);
            }  
      `
        },
    },
    {
        uuid: "horizontal_alignement_handler_block",
        applicationId: "1",
        name: "horizontal alignement handler block",
        component_type: ComponentType.VerticalContainer,
        ...COMMON_ATTRIBUTES,
        style: {
            width: "220px",
            'margin-top': '10px',
            display:'flex',
            'justify-content':'space-between',
        },
        
        childrenIds: ["horizontal_alignement_handler"],
    },
    {
        uuid: "horizontal_alignement_handler",
        applicationId: "1",
        component_type: ComponentType.Event,
        ...COMMON_ATTRIBUTES,
        styleHandlers: {},
        name: "horizontal alignement handler",
        style: {
                display:'block',
                width: "250px", 
        },
        input: { 
            value: {
                type: 'handler',
                value: /* js */`
                const parameter ='horizontalAlignement';
                let horizontalAlignementHandler=''
                try{
                    const selectedComponens =  GetVar( "selectedComponents")||[];
                    if( selectedComponens.length) {
                    const selectedComponent = selectedComponens[0];
                    const currentComponent = GetComponent(selectedComponent, GetVar("currentEditingApplication").uuid)    
                    horizontalAlignementHandler= currentComponent?.styleHandlers && currentComponent?.styleHandlers['justify-content'] || ''  
                    }
                }catch(error){
                    console.log(error);
                }
                return [parameter,horizontalAlignementHandler];
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
                    
                    updateStyleHandlers(currentComponent,'justify-content',EventData.value)
                }
            }catch(error){
                console.log(error);
            }
      `
        },
    },
] 
