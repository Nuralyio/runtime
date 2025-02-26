import { ComponentType } from "$store/component/interface.ts";
import { COMMON_ATTRIBUTES } from "../helper/common_attributes.ts";

export default [
  {

    uuid: "border_radius_vertical_container",
    application_id: "1",
    name: "Left panel",
    component_type: ComponentType.Container,
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

    application_id: "1",
    ...COMMON_ATTRIBUTES,
    input: {
      value: {
        type: "string",
        value: 'Border radius'
      }
    },
    style: {
      "width": "90px"
    }
  },
  {
    uuid: "border_radius_block",
    name: "name",
    application_id: "1",
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
                            updateStyle(currentComponent, EventData.attributeName,EventData.value);
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
        try {
          const selectedComponents = GetVar("selectedComponents") || [];
          if (selectedComponents.length) {
              const selectedComponent = selectedComponents[0];
              const currentEditingAppUUID = GetVar("currentEditingApplication").uuid;
              const currentComponent = GetComponent(selectedComponent, currentEditingAppUUID);
      
              if (currentComponent?.style) {
                  const propertiesToExtract = [
                      "border-radius",
                      "margin-left",
                      "margin-top",
                      "margin-bottom",
                      "margin-right",
                      "padding-left",
                      "padding-right",
                      "padding-top",
                      "padding-bottom",
                      "border-bottom-right-radius"
                  ];
      
                  const extractedStyles = {};
      
                  propertiesToExtract.forEach((prop) => {
                      const propValue = currentComponent.style[prop];
                      if (propValue) {
                          let value = '';
                          let unit = '';
                          
                          propValue.split('').forEach((char) => {  
                              if ((char >= '0' && char <= '9') || char === '.') {
                                  value += char;
                              } else {
                                  unit += char;
                              }
                          });
      
                          const numericValue = parseFloat(value) || 0;
                          const unitType = unit || 'px'; // Default to 'px' if unit is missing
      
                          extractedStyles[prop] = {
                              value: numericValue,
                              unit: unitType
                          };
                      } else {
                          extractedStyles[prop] = {
                              value: 0,
                              unit: 'px'
                          };
                      }
                  });
      
                  return extractedStyles;
              } else {
                  return {
                      "border-radius": { value: 0, unit: 'px' },
                      "margin-left": { value: 0, unit: 'px' },
                      "margin-right": { value: 0, unit: 'px' },
                      "padding-left": { value: 0, unit: 'px' },
                      "padding-right": { value: 0, unit: 'px' },
                      "margin-top": { value: 0, unit: 'px' },
                      "margin-bottom": { value: 0, unit: 'px' },
                      "padding-top": { value: 0, unit: 'px' },
                      "padding-bottom": { value: 0, unit: 'px' },
                      "padding-bottom": { value: 0, unit: 'px' },
                      "border-bottom-right-radius": { value: 0, unit: 'px' },
                  };
              }
          }
      } catch (e) {
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

 
];