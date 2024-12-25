import { ComponentType } from "$store/component/interface.ts";
import { COMMON_ATTRIBUTES } from "../helper/common_attributes.ts";

export default [
  {

    uuid: "border_radius_vertical_container",
    applicationId: "1",
    name: "Left panel",
    component_type: ComponentType.VerticalContainer,
    ...COMMON_ATTRIBUTES,
    style: {
      display: "flex",
      "align-items": "center",
      "justify-content": "space-between",
      "width": "290px"
    },
    childrenIds: ["border_radius_label", "border_radius_block", "label_border_radius_handler"]

  },
  {
    uuid: "border_radius_label",
    name: "text_label",
    component_type: ComponentType.TextLabel,

    applicationId: "1",
    ...COMMON_ATTRIBUTES,
    input: {
      value: {
        type: "handler",
        value: /* js */`
               const label ='Border radius';
             return label;
            `
      }
    },
    style: {
      "width": "90px"
    }
  },
  {
    uuid: "border_radius_block",
    name: "name",
    applicationId: "1",
    component_type: ComponentType.BorderRadius,
    ...COMMON_ATTRIBUTES,
    style: {
      width: "50px"
    },
    event: {
      borderRadiusChanged:  /* js */ `
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
                if (currentComponent?.style && currentComponent.style["border-radius"]) {
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
                            return [value,unity]
                          }
                         else 
                            return [0,'px']    
                              
                
            }

        }catch(e){
            console.log(e);
        }
            `
      },
      state: {
        type: "handler",
        value:/* js */`
            
            try{
                const selectedComponens =  GetVar( "selectedComponents")||[];
                if( selectedComponens.length) {
                    const selectedComponent = selectedComponens[0];
                    const currentComponent = GetComponent(selectedComponent, GetVar("currentEditingApplication").uuid)
                    let state='enabled' 
                    if(currentComponent.styleHandlers && currentComponent.styleHandlers['border-radius'])
                     {  state='disabled'
                        
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
    uuid: "label_border_radius_handler",
    applicationId: "1",
    component_type: ComponentType.Event,
    ...COMMON_ATTRIBUTES,
    styleHandlers: {},
    name: "label border radius handler",
    style: {
      display: "block",
      width: "250px"
    },
    input: {
      value: {
        type: "handler",
        value: /* js */`
                const parameter ='borderRadius';
                let borderRadiusHandler =''
                try{
                    const selectedComponens =  GetVar( "selectedComponents")||[];
                    if( selectedComponens.length) {
                    const selectedComponent = selectedComponens[0];
                    const currentComponent = GetComponent(selectedComponent, GetVar("currentEditingApplication").uuid)    
                    borderRadiusHandler= currentComponent?.styleHandlers && currentComponent?.styleHandlers['border-radius'] || ''  
                    }
                }catch(error){
                    console.log(error);
                }
                return [parameter,borderRadiusHandler];
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
    }
  }
];