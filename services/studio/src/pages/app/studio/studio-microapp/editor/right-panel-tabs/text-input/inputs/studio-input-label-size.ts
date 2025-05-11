import { ComponentType } from "$store/component/interface.ts";
import { COMMON_ATTRIBUTES } from "../../../../helper/common_attributes.ts";
import { InputBlockContainerTheme } from "../../../utils/common-editor-theme.ts";

export default [
  {
    uuid: "input_label_font_size_vertical_container",
    application_id: "1",
    name: "Left panel",
    component_type: ComponentType.Container,
    ...COMMON_ATTRIBUTES,
    style: {
      ...InputBlockContainerTheme
    },
    childrenIds: ["input_label_font_size_block", "input_label_size_handler_block"]
  },
  {
    uuid: "input_label_font_size_block",
    application_id: "1",
    name: "Left panel",
    component_type: ComponentType.Container,
    ...COMMON_ATTRIBUTES,
    style: {
      display: "flex",
      "justify-content": "space-between",
      "align-items": "center"
    },
    childrenIds: ["text_label_label_font_size"]
  },

  {
    uuid: "text_label_label_font_size",
    name: "text_label",
    component_type: ComponentType.TextLabel,
    application_id: "1",
    ...COMMON_ATTRIBUTES,
    style: {
      width: "90px"
    },
    input: {
      value: {
        type: "string",
        value: 'Label size'
      }
    }

  },
  {
    uuid: "font_size_input",
    name: "name",
    application_id: "1",
    component_type: ComponentType.NumberInput,
    parameters: {
      value: "22px"
    },
    ...COMMON_ATTRIBUTES,
    style: {
      width: "100px",
      size: "small"
    },
    event: {
      valueChange:  /* js */ `
                    
                        const selectedComponent = Utils.first(Vars.selectedComponents);
                            
                            
                            const unity= EventData.unity ||"px"
                            updateStyle(selectedComponent, "--hybrid-input-label-font-size", EventData.value+unity);
                        
                                     
  `
    },
    input: {
      value: {
        type: "handler",
        value: /* js */`
            
            const selectedComponent = Utils.first(Vars.selectedComponents);
                if(!selectedComponent) return
                
                const fontSize =selectedComponent.style && selectedComponent.style['--hybrid-input-label-font-size']?.split('')
                if(fontSize) 
                    {
                        let unity='';
                        let value='';
                        fontSize.forEach((char)=>
                            {
                            if(char>='0' && char<='9')
                                value+=char 
                            else 
                            unity+=char
                           }
                        );
                        return [+value,unity]
                    }
                    else 
                       return [13,'px']

        
            `
      },
      state: {
        type: "handler",
        value:/* js */`
                
                    const selectedComponent = Utils.first(Vars.selectedComponents);
                        
                        
                        let state='enabled';
                        if(selectedComponent?.styleHandlers && selectedComponent?.styleHandlers['--hybrid-input-label-font-size']){
                         state='disabled'
                        }
                        return state
        
                 
                
                `
      }
    }
  },
  {
    uuid: "input_label_size_handler_block",
    application_id: "1",
    name: "input label size handler block",
    component_type: ComponentType.Container,
    ...COMMON_ATTRIBUTES,
    style: {
      display: "flex",
      "justify-content": "space-between"
    },
    childrenIds: [ "font_size_input","input_label_size_handler"]
  },
  {
    uuid: "input_label_size_handler",
    application_id: "1",
    component_type: ComponentType.Event,
    ...COMMON_ATTRIBUTES,
    styleHandlers: {},
    name: "input label size handler",
    style: {
      display: "block"
    },
    input: {
      value: {
        type: "handler",
        value: /* js */`
                const parameter ='labelSize';
                let labelSizeHandler =''
                
                    const selectedComponent = Utils.first(Vars.selectedComponents);
                    
                        
                    labelSizeHandler= selectedComponent?.styleHandlers && selectedComponent?.styleHandlers['--hybrid-input-label-font-size'] || ''  
                
                return [parameter,labelSizeHandler];
            `
      }
    },

    event: {
      codeChange: /* js */ `
            
                const selectedComponent = Utils.first(Vars.selectedComponents);
                    
                    
                    updateStyleHandlers(selectedComponent,'--hybrid-input-label-font-size',EventData.value)
            
      `
    }
  }

];