import { ComponentType } from "../interface";
import { COMMON_ATTRIBUTES } from "../helper/common_attributes";
export default [
    {
    
            uuid: "border_radius_vertical_container",
            applicationId: "1",
            name: "Left panel",
            component_type: ComponentType.VerticalContainer,
            ...COMMON_ATTRIBUTES,
            style: {
                width: "250px",
                display:'flex',
                'flex-direction':'column',
            },
            childrenIds: ["border_radius_label","border_radius_block","label_border_radius_handler_block"],
        
    },
    {
        uuid: "border_radius_label",
        name: "text_label",
        component_type: ComponentType.TextLabel,
        
        applicationId: "1",
        ...COMMON_ATTRIBUTES,
        input: {
            value: {
                type: 'handler',
                value: /* js */`
               const label ='Border radius';
               label;
            `
            }
        },
       style:{
        display:true
       }
    },
    {
        uuid: "border_radius_block",
        name: "name",
        applicationId: "1",
        component_type: ComponentType.BorderRadius,
        ...COMMON_ATTRIBUTES,
        event: {
            borderRadiusChanged: {
                type: "handler",
                value: /* js */ `
                    try{
                        const selectedComponens =  GetVar( "selectedComponents")||[];
                        if( selectedComponens.length) {
                            const selectedComponent = selectedComponens[0];
                            const currentComponent = GetComponent(selectedComponent, GetVar("currentEditingApplication").uuid)
                            updateStyle(currentComponent, "border-radius",EventData.value+EventData.unity);
                        }
                    }catch(error){
                        console.log(error);
                    }      
  `
            }
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
                if (currentComponent?.style["border-radius"]) {
                            let unity='';
                            let value='';
                            currentComponent.style["border-radius"].split('').forEach((char)=>
                                {  
                                if(char>='0' && char<='9')
                                    value+=char 
                                else 
                                unity+=char
                               }
                            );
                            [value,unity]
                          }
                         else 
                            [0,'px']    
                              
                
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
                    let state='' 
                    if(currentComponent.styleHandlers && currentComponent.styleHandlers['border-radius'])
                     {  state='disabled'
                        
                     }
                     state
                }
    
            }catch(e){
                console.log(e);
            }
            
            `

            }

        }
    },
    {
        uuid: "label_border_radius_handler_block",
        applicationId: "1",
        name: "label border radius handler block",
        component_type: ComponentType.VerticalContainer,
        ...COMMON_ATTRIBUTES,
        style: {
            width: "220px",
            'margin-top': '10px',
            display:'flex',
            'justify-content':'space-between',
        }, 
        childrenIds: ["label_border_radius_handler"],
    },
    {
        uuid: "label_border_radius_handler",
        applicationId: "1",
        component_type: ComponentType.Event,
        ...COMMON_ATTRIBUTES,
        styleHandlers: {},
        name: "label border radius handler",
        style: {
                display:'block',
                width: "250px", 
        },
        input: { 
            value: {
                type: 'handler',
                value: /* js */`
                const parameter ='borderRadius';
                let borderRadiusHandler =''
                try{
                    const selectedComponens =  GetVar( "selectedComponents")||[];
                    if( selectedComponens.length) {
                    const selectedComponent = selectedComponens[0];
                    const currentComponent = GetComponent(selectedComponent, GetVar("currentEditingApplication").uuid)    
                    borderRadiusHandler= currentComponent?.styleHandlers['border-radius'] || ''  
                    }
                }catch(error){
                    console.log(error);
                }
                [parameter,borderRadiusHandler];
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
                    updateStyleHandlers(currentComponent,'border-radius',EventData.value)
                }
            }catch(error){
                console.log(error);
            }
      `
        },
    },
]