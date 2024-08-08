import { ComponentType } from "../interface";
import { COMMON_ATTRIBUTES } from "../helper/common_attributes";
export default [
    {
    
            uuid: "border_radius_vertical_container",
            applicationId: "1",
            name: "Left panel",
            component_type: ComponentType.VerticalContainer,
            styleHandlers: {},
            input: {
                direction: "vertical",
            },
    
            ...COMMON_ATTRIBUTES,
            style: {
                width: "250px",
                display:'flex',
                'flex-direction':'column',
            },
            childrenIds: ["border_radius_label","border_radius_block"],
        
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
        styleHandlers: {},
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
                if (currentComponent.style["border-radius"]) {
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
            }
        }
    },
]