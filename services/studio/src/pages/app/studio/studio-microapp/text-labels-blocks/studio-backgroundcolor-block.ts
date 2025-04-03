import { ComponentType } from "$store/component/interface.ts";
import { COMMON_ATTRIBUTES } from "../helper/common_attributes.ts";

export default [

  {
    uuid: "background_color_block",
    application_id: "1",
    name: "Left panel",
    component_type: ComponentType.Container,
    styleHandlers: {},
    input: {
      direction: "vertical"
    },

    ...COMMON_ATTRIBUTES,
    style: {
      width: "250px",
      display: "flex",
      "flex-direction": "column",
      "margin-top": "10px"
    },
    childrenIds: ["text_label_background_color", "background_color_value"]
  },
  {
    uuid: "text_label_background_color",
    name: "text_label",
    component_type: ComponentType.TextLabel,
    application_id: "1",
    ...COMMON_ATTRIBUTES,
    input: {
      value: {
        type: "string",
        value: 'Background Color'
      }
    }
  },
  {
    uuid: "background_color_value",
    name: "name",
    application_id: "1",
    component_type: ComponentType.ColorPicker,
    event: {
      valueChange: /* js */ `
           
           
                const selectedComponent = Utils.first(Vars.selectedComponents);
                
                    
                    
                    updateStyle(selectedComponent, "background-color", EventData.value);
                
            
            
      `
    },
    ...COMMON_ATTRIBUTES,
    input: {
      value: {
        type: "handler",
        value: /* js */`
                    
                        const selectedComponent = Utils.first(Vars.selectedComponents);
                            
                            
                            return selectedComponent.style?.backgroundColor || "#ffffff";

                  
                `
      }
    }
  }
];