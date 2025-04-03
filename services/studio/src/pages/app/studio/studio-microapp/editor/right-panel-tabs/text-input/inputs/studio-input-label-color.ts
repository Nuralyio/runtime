import { ComponentType } from "$store/component/interface.ts";
import { COMMON_ATTRIBUTES } from "../../../../helper/common_attributes.ts";

export default [
  {
    uuid: "input_label_color_block",
    application_id: "1",
    name: "input label color block",
    component_type: ComponentType.Container,
    ...COMMON_ATTRIBUTES,
    style: {

      display: "flex",
      "align-items": "center",
      "justify-content": "space-between",
      "margin-top": "10px"
    },
    childrenIds: ["label_input_block", "input_label_color_handler_block"]
  },
  {
    uuid: "label_input_block",
    application_id: "1",
    name: "label input block",
    component_type: ComponentType.Container,
    ...COMMON_ATTRIBUTES,
    style: {
      display: "flex",
      "align-items": "center",
      "justify-content": "space-between"
    },
    childrenIds: ["input_label_color_label", "label_color_input"]
  },
  {
    uuid: "input_label_color_label",
    name: "input label color label",
    component_type: ComponentType.TextLabel,
    application_id: "1",
    ...COMMON_ATTRIBUTES,
    style: {
      width: "90px"
    },
    input: {
      value: {
        type: "string",
        value: 'Label color'
      }
    }
  },
  {
    uuid: "label_color_input",
    name: "name",
    application_id: "1",
    component_type: ComponentType.ColorPicker,
    event: {
      valueChange: /* js */ `
       
       
            const selectedComponent = Utils.first(Vars.selectedComponents);
            
                
                
                updateStyle(selectedComponent, "--hybrid-input-label-color", EventData.value);
            
        
        
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
                        return selectedComponent.style['--hybrid-input-label-color'];

                
            `
      },
      state: {
        type: "handler",
        value:/* js */ `
            
                const selectedComponent = Utils.first(Vars.selectedComponents);
                    
                    
                    let state='enabled';
                    if(selectedComponent.styleHandlers && selectedComponent.styleHandlers['--hybrid-input-label-color']){
                        state='disabled'
                    }
                    state;

            
            `
      }
    }
  },
  {
    uuid: "input_label_color_handler_block",
    application_id: "1",
    name: "input label color handler block",
    component_type: ComponentType.Container,
    ...COMMON_ATTRIBUTES,
    style: {
      width: "50px",
      display: "flex",
      "justify-content": "space-between"
    },

    childrenIds: ["input_label_color_handler"]
  },
  {
    uuid: "input_label_color_handler",
    application_id: "1",
    component_type: ComponentType.Event,
    ...COMMON_ATTRIBUTES,
    styleHandlers: {},
    name: "label color handler",
    style: {
      display: "block"
    },
    input: {
      value: {
        type: "handler",
        value: /* js */`
            const parameter ='labelColor';
            let labelColorHandler=''
            
                const selectedComponent = Utils.first(Vars.selectedComponents);
                
                    
                labelColorHandler=selectedComponent.styleHandlers && selectedComponent.styleHandlers['--hybrid-input-label-color'] || ''  
            
            return [parameter,labelColorHandler];
        `
      }
    },

    event: {
      codeChange: /* js */ `
        
            const selectedComponent = Utils.first(Vars.selectedComponents);
                
                
                updateStyleHandlers(selectedComponent,'--hybrid-input-label-color',EventData.value)
        
  `
    }
  }
];
