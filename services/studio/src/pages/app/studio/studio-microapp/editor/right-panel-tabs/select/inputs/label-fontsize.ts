import { ComponentType } from "$store/component/interface.ts";
import { COMMON_ATTRIBUTES } from "../../../../helper/common_attributes.ts";
import { InputBlockContainerTheme, TextInputTheme } from "../../../utils/common-editor-theme.ts";

export default [
  {
    uuid: "select_label_font_size_vertical_container",
    applicationId: "1",
    name: "Left panel",
    component_type: ComponentType.VerticalContainer,
    ...COMMON_ATTRIBUTES,
    style: {
      ...InputBlockContainerTheme
    },
    childrenIds: ["select_label_size_input_block", "label_size_handler_block"]
  },
  {
    uuid: "select_label_size_input_block",
    applicationId: "1",
    name: "select label size input block",
    component_type: ComponentType.VerticalContainer,
    ...COMMON_ATTRIBUTES,
    style: {
      display: "flex",
      "align-items": "center",
      "justify-content": "space-between"
    },
    childrenIds: ["select_text_label_font_size"]
  },

  {
    uuid: "select_text_label_font_size",
    name: "text_label",
    component_type: ComponentType.TextLabel,
    applicationId: "1",
    ...COMMON_ATTRIBUTES,
    style: {
      width: "90px"
    },
    input: {
      value: {
        type: "handler",
        value: /* js */`
                const label ='Label size';
                return label;
            `
      }
    }

  },
  {
    uuid: "select_font_size_label_input",
    name: "name",
    applicationId: "1",
    component_type: ComponentType.NumberInput,
    parameters: {
      value: "22px"
    },
    ...COMMON_ATTRIBUTES,
    style: {
      ...TextInputTheme
    },
    event: {
      valueChange: /* js */ `
                    try{
                        const selectedComponens =  GetVar( "selectedComponents")||[];
                        if( selectedComponens.length) {
                            const selectedComponent = selectedComponens[0];
                            const currentComponent = GetComponent(selectedComponent, GetVar("currentEditingApplication").uuid)
                            const unity = EventData.unity || "px"
                            updateStyle(currentComponent, "--hybrid-select-label-font-size", EventData.value+unity);
                        
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
                const fontSize =currentComponent?.style && currentComponent.style['--hybrid-select-label-font-size']?.split('')
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
                    if(selectedComponens.length) {
                        const selectedComponent = selectedComponens[0];
                        const currentComponent = GetComponent(selectedComponent, GetVar("currentEditingApplication").uuid)
                        let state='enabled';
                        if(currentComponent.styleHandlers && currentComponent.styleHandlers['--hybrid-select-label-font-size']){
                         state='disabled'
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
    uuid: "label_size_handler_block",
    applicationId: "1",
    name: "label size handler block",
    component_type: ComponentType.VerticalContainer,
    ...COMMON_ATTRIBUTES,
    style: {
      display: "flex",
      "justify-content": "space-between"
    },
    childrenIds: ["select_font_size_label_input", "label_size_handler"]
  },
  {
    uuid: "label_size_handler",
    applicationId: "1",
    component_type: ComponentType.Event,
    ...COMMON_ATTRIBUTES,
    styleHandlers: {},
    name: "label size handler",
    style: {
      display: "block"
    },
    input: {
      value: {
        type: "handler",
        value: /* js */`
                const parameter ='labelSize';
                let labelSizeHandler =''
                try{
                    const selectedComponens =  GetVar( "selectedComponents")||[];
                    if( selectedComponens.length) {
                    const selectedComponent = selectedComponens[0];
                    const currentComponent = GetComponent(selectedComponent, GetVar("currentEditingApplication").uuid)    
                    labelSizeHandler= currentComponent?.styleHandlers && currentComponent?.styleHandlers['--hybrid-select-label-font-size'] || ''  
                    }
                }catch(error){
                    console.log(error);
                }
                return [parameter,labelSizeHandler];
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
                    updateStyleHandlers(currentComponent,'--hybrid-select-label-font-size',EventData.value)
                }
            }catch(error){
                console.log(error);
            }
      `
    }
  }

];