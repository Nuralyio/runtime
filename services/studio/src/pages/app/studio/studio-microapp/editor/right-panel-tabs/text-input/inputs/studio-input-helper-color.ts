import { ComponentType } from "$store/component/interface.ts";
import { COMMON_ATTRIBUTES } from "../../../../helper/common_attributes.ts";

export default [
  {
    uuid: "input_helper_color_block",
    application_id: "1",
    name: "input helper color block",
    component_type: ComponentType.Container,
    ...COMMON_ATTRIBUTES,
    style: {

      display: "flex",
      "align-items": "center",
      "justify-content": "space-between",
      "margin-top": "10px"
    },
    childrenIds: ["input_helper_input_block", "input_helper_color_handler_block"]
  },
  {
    uuid: "input_helper_input_block",
    application_id: "1",
    name: "placeholder block",
    component_type: ComponentType.Container,
    ...COMMON_ATTRIBUTES,
    style: {
      display: "flex",
      "align-items": "center",
      "justify-content": "space-between"
    },
    childrenIds: ["input_helper_color_label", "helper_color_input"]
  },
  {
    uuid: "input_helper_color_label",
    name: "input helper color label",
    component_type: ComponentType.TextLabel,
    application_id: "1",
    ...COMMON_ATTRIBUTES,
    style: {
      width: "90px"
    },
    input: {
      value: {
        type: "string",
        value:'Helper color'
      }
    }
  },
  {
    uuid: "helper_color_input",
    name: "name",
    application_id: "1",
    component_type: ComponentType.ColorPicker,
    event: {
      valueChange: /* js */ `
       
       
            const selectedComponent = Utils.first(Vars.selectedComponents);
                
                
                updateStyle(selectedComponent, "--hybrid-input-helper-text-color", EventData.value);
        
        
  `
    },
    ...COMMON_ATTRIBUTES,
    style: {
      width: "50px",
      display: "block"
    },
    input: {
      value: {
        type: "handler",
        value: /* js */`
                
                    const selectedComponent = Utils.first(Vars.selectedComponents);
                        
                        
                        if(selectedComponent.style)
                        return selectedComponent.style['--hybrid-input-helper-text-color'];

                
            `
      },
      state: {
        type: "handler",
        value:/* js */ `
            
                const selectedComponent = Utils.first(Vars.selectedComponents);
                    
                    
                    let state='enabled';
                    if(selectedComponent?.styleHandlers && selectedComponent?.styleHandlers['--hybrid-input-helper-text-color']){
                        state='disabled'
                    }
                    return state;

            
            `
      }
    }
  },
  {
    uuid: "input_helper_color_handler_block",
    application_id: "1",
    name: "input helper color handler block",
    component_type: ComponentType.Container,
    ...COMMON_ATTRIBUTES,
    style: {
      width: "50px",
      display: "flex",
      "justify-content": "space-between"
    },

    childrenIds: ["input_helper_color_handler"]
  },
  {
    uuid: "input_helper_color_handler",
    application_id: "1",
    component_type: ComponentType.Event,
    ...COMMON_ATTRIBUTES,
    styleHandlers: {},
    name: "helper color handler",
    style: {
      display: "block"
    },
    input: {
      value: {
        type: "handler",
        value: /* js */`
            const parameter ='helperColor';
            let helperColorHandler=''
            
                const selectedComponent = Utils.first(Vars.selectedComponents);
                
                    
                helperColorHandler= selectedComponent?.styleHandlers && selectedComponent?.styleHandlers['--hybrid-input-helper-text-color'] || ''  
            
            return [parameter,helperColorHandler];
        `
      }
    },

    event: {
      codeChange: /* js */ `
        
            const selectedComponent = Utils.first(Vars.selectedComponents);
                
                
                updateStyleHandlers(selectedComponent,'--hybrid-input-helper-text-color',EventData.value)
        
  `
    }
  }
];
