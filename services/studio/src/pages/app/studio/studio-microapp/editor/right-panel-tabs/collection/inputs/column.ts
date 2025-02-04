import { ComponentType } from "$store/component/interface.ts";
import { COMMON_ATTRIBUTES } from "pages/app/studio/studio-microapp/helper/common_attributes";

export const StudioCollectionColumnInput =  [
  {
    uuid: "column_vertical_container",
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
    childrenIds: ["text_label_column", "column_input_2", "label_fontsize_handler"]
  },

  {
    uuid: "text_label_column",
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
        value: 'Column'
      }
    }

  },
  {
    uuid: "column_input_2",
    name: "name",
    application_id: "1",
    component_type: ComponentType.NumberInput,
    parameters: {
      value: "22px"
    },
    ...COMMON_ATTRIBUTES,
    style: {
      width: "155px",
      size: "small"
    },
    event: {
      valueChange:  /* js */`

                const selectedComponent = Utils.first(Editor.selectedComponents);
                updateStyle(selectedComponent, "--columns", EventData.value);
                        
                   
                    
  `
    },
    input: {
      value: {
        type: "handler",
        value: /* js */`
        const selectedComponent = Utils.first(Editor.selectedComponents);
                let fontSize =  Editor.getComponentStyle(Utils.first(Editor.selectedComponents), '--columns') || 1;
                 return [fontSize ]

            `
      },
      state: {
        type: "handler",
        value:/* js */`
                    const selectedComponent = Utils.first(Editor.selectedComponents);
                        let state='enabled';
                        if(selectedComponent.styleHandlers && selectedComponent.styleHandlers['fontSize']){
                         state='disabled'
                        }
                        return state
                
                `
      }
    }
  },

  {
    uuid: "label_fontsize_handler",
    application_id: "1",
    component_type: ComponentType.Event,
    ...COMMON_ATTRIBUTES,
    styleHandlers: {},
    name: "label font size handler",
    style: {
      display: "block"
    },
    input: {
      value: {
        type: "handler",
        value: /* js */`
                const parameter ='labelFontSize';
                let labelFontSizeHandler =''
                try{
                    const selectedComponent = Utils.first(Editor.selectedComponents);
                    labelFontSizeHandler= selectedComponent?.styleHandlers && selectedComponent?.styleHandlers['fontSize'] || ''  
                }catch(error){
                }
                return [parameter,labelFontSizeHandler];
            `
      }
    },

    event: {
      codeChange: /* js */ `
                const selectedComponent = Utils.first(Editor.selectedComponents);
                    updateStyleHandlers(selectedComponent,'--columns',EventData.value)
      `
    }
  }


];