import { ComponentType } from "$store/component/interface.ts";
import { RadioButtonWithThreeOptionsTheme } from "../editor/utils/common-editor-theme.ts";
import { COMMON_ATTRIBUTES } from "../helper/common_attributes.ts";

export default [
  {
    uuid: "text_alignement_block",
    application_id: "1",
    name: "Left panel",
    component_type: ComponentType.Container,
    ...COMMON_ATTRIBUTES,
    style: {
      display: "flex",
      "align-items": "center",
      "justify-content": "space-between",
      "width": "276px"
    },

    childrenIds: ["text_label_alignement", "text-align-content", "horizontal_alignement_handler"]
  },
  {
    uuid: "text_label_alignement",
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
        value: 'Horizontal alignment'
      }
    }
  },
  {
    uuid: "text-align-content",
    name: "name",
    application_id: "1",
    component_type: ComponentType.RadioButton,
    ...COMMON_ATTRIBUTES,
    style: {
     ...RadioButtonWithThreeOptionsTheme
    },

    input: {
      value: {
        type: "handler",
        value: /* js */ `
            const selectedComponent = Utils.first(Vars.selectedComponents);
            
        
            if (!selectedComponent) {
                // Return default values if no component is selected
                return [
                    [
                        { value: 'start', icon: "align-left", disabled: false },
                        { value: 'center', icon: "align-center", disabled: false },
                        { value: 'end', icon: "align-right", disabled: false }
                    ],
                    'start',
                    'button'
                ];
            }
        
            
            
        
            if (!selectedComponent) {
                // Return default values if the current component is not found
                return [
                    [
                        { value: 'start', icon: "align-left", disabled: false },
                        { value: 'center', icon: "align-center", disabled: false },
                        { value: 'end', icon: "align-right", disabled: false }
                    ],
                    'start',
                    'button'
                ];
            }
        
            const hasJustifyContentHandler = selectedComponent?.styleHandlers?.['justify-content'];
            const defaultTextAlign = hasJustifyContentHandler
                ? ''
                : selectedComponent.style?.['justify-content'] || 'start';
        
            const options = [
                { value: 'start', icon: "align-left", disabled: !!hasJustifyContentHandler },
                { value: 'center', icon: "align-center", disabled: !!hasJustifyContentHandler },
                { value: 'end', icon: "align-right", disabled: !!hasJustifyContentHandler }
            ];
        
            const radioType = 'button';
        
            return [options, defaultTextAlign, radioType];
                `
      }
    },
    event: {
      changed: /* js */ `
           
                const selectedComponent = Utils.first(Vars.selectedComponents);
                
                    
                    
                    const currentComponentDisplay = selectedComponent.style['display'];
                    const textAlignValue = EventData.value;
                    if(currentComponentDisplay!='flex')
                    updateStyle(selectedComponent, "display", 'flex');
                
                    updateStyle(selectedComponent, "justify-content", textAlignValue);
              
      `
    }
  },

  {
    uuid: "horizontal_alignement_handler",
    application_id: "1",
    component_type: ComponentType.Event,
    ...COMMON_ATTRIBUTES,
    styleHandlers: {},
    name: "horizontal alignement handler",
    style: {
      display: "block"
    },
    input: {
      value: {
        type: "handler",
        value: /* js */`
                const parameter ='horizontalAlignement';
                let horizontalAlignementHandler=''
                
                    const selectedComponent = Utils.first(Vars.selectedComponents);
                    
                        
                    horizontalAlignementHandler= selectedComponent?.styleHandlers && selectedComponent?.styleHandlers['justify-content'] || ''  
                
                return [parameter,horizontalAlignementHandler];
            `
      }
    },

    event: {
      codeChange: /* js */ `
            
                const selectedComponent = Utils.first(Vars.selectedComponents);
                    
                    
                    const currentComponentDisplay = selectedComponent.style['display'];
                    
                    if(currentComponentDisplay!='flex')
                     updateStyle(selectedComponent, "display", 'flex');
                    
                    updateStyleHandlers(selectedComponent,'justify-content',EventData.value)
            
      `
    }
  }
];
