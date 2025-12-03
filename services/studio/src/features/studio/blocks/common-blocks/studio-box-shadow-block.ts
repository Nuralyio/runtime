import { COMMON_ATTRIBUTES } from "../../core/helpers/common_attributes.ts";

export default [
  {
    // @todo: re-apply the box shadow block 
    uuid: "box_shadow_block",
    name: "name",
    application_id: "1",
    component_type: "vertical-container-block",
    styleHandlers: {},
    ...COMMON_ATTRIBUTES,
    style: {
      "margin-top": "10px"
    },
    childrenIds: ["box_shadow_label", "box_shadow_values", "box_shadow_handler_block"]
  },
  {
    uuid: "box_shadow_label",
    name: "box shadow label",
    component_type: "text_label",
    application_id: "1",
    ...COMMON_ATTRIBUTES,
    input: {
      value: {
        type: "string",
        value: 'Box shadow'
      }
    },
    style: {
      width: "100px",
      display: "block",
      "margin-bottom": "5px"
    }
  },
  {
    uuid: "box_shadow_valuess",
    name: "name",
    application_id: "1",
    component_type: "shadow_box",
    styleHandlers: {},
    ...COMMON_ATTRIBUTES,
    event: {
      boxShadowChanged:  /* js */ `
                    
                        const selectedComponent = Utils.first(Vars.selectedComponents);
                        
                            
                            
                            updateStyle(selectedComponent, "box-shadow",EventData.value);
                        
                          
  `
    },
    input: {
      value: {
        type: "handler",
        value: /* js */`
            
            const selectedComponent = Utils.first(Vars.selectedComponents);

                
                
                if (selectedComponent.style && selectedComponent.style["box-shadow"]) {
                    const values = selectedComponent.style["box-shadow"].match(/-?[0-9]+px/g);  
                    const horizontalValue = parseInt(values[0], 10);
                    const verticalValue = parseInt(values[1], 10);
                    const blurValue = parseInt(values[2], 10);
                    const spreadValue = parseInt(values[3], 10);
                    const colorMatch = selectedComponent.style["box-shadow"].match(/#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})/);
                    const insetMatch = selectedComponent.style["box-shadow"].includes('inset');
                    const colorValue = colorMatch ? colorMatch[0] : "#ffffff";
                    const result=[horizontalValue,verticalValue,blurValue,spreadValue,insetMatch,colorValue];
                    return  result;

                }
                else {
                    const horizontalValue = 0;
                    const verticalValue = 0;
                    const blurValue = 0;
                    const spreadValue = 0;
                    const colorValue = "#000000";
                    const insetValue = false;
                    return [horizontalValue,verticalValue,blurValue,spreadValue,insetValue,colorValue]
                }
                

        
            `
      },
      state: {
        type: "handler",
        value:/* js */`

                
                    const selectedComponent = Utils.first(Vars.selectedComponents);
                        
                        
                        let state ='enabled'
                        if(selectedComponent?.styleHandlers && selectedComponent?.styleHandlers['box-shadow']){
                               state='disabled'
                        }
                        return state;
                
                
                `
      }
    }
  },
  {
    uuid: "box_shadow_handler_block",
    application_id: "1",
    name: "box shadow handler block",
    component_type: "vertical-container-block",
    ...COMMON_ATTRIBUTES,
    style: {
      width: "220px",
      display: "flex",
      "justify-content": "space-between"
    },
    childrenIds: ["box_shadow_handler"]
  },
  {
    uuid: "box_shadow_handler",
    application_id: "1",
    component_type: "event",
    ...COMMON_ATTRIBUTES,
    styleHandlers: {},
    name: "box shadow handler",
    style: {
      display: "block",
      width: "250px"
    },
    input: {
      value: {
        type: "handler",
        value: /* js */`
                const parameter ='boxShadow';
                let boxShadowHandler =''
                
                    const selectedComponent = Utils.first(Vars.selectedComponents);
                    
                        
                    boxShadowHandler= selectedComponent?.styleHandlers && selectedComponent?.styleHandlers['box-shadow'] || ''  
                
                return [parameter,boxShadowHandler];
            `
      }
    },

    event: {
      codeChange: /* js */ `
            
                const selectedComponent = Utils.first(Vars.selectedComponents);
                    
                    
                    updateStyleHandlers(selectedComponent,'box-shadow',EventData.value)
            
      `
    }
  }

];