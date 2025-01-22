import { ComponentType } from "$store/component/interface.ts";
import { COMMON_ATTRIBUTES } from "../../../../helper/common_attributes.ts";

export default [
  {
    uuid: "input_helper_color_block",
    applicationId: "1",
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
    applicationId: "1",
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
    applicationId: "1",
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
    applicationId: "1",
    component_type: ComponentType.ColorPicker,
    event: {
      valueChange: /* js */ `
       
       try{
            const selectedComponens =  GetVar( "selectedComponents")||[];
            if( selectedComponens.length) {
                const selectedComponent = selectedComponens[0];
                const currentComponent = GetComponent(selectedComponent, GetVar("currentEditingApplication").uuid)
                updateStyle(currentComponent, "--hybrid-input-helper-text-color", EventData.value);
            
            }
        }catch(error){
            console.log(error);
        }
        
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
                try{
                    const selectedComponens =  GetVar( "selectedComponents")||[];
                    if( selectedComponens.length) {
                        const selectedComponent = selectedComponens[0];
                        const currentComponent = GetComponent(selectedComponent, GetVar("currentEditingApplication").uuid)
                        if(currentComponent?.style)
                        return currentComponent.style['--hybrid-input-helper-text-color'];
                    }

                }catch(e){
                    console.log(e);
                }
            `
      },
      state: {
        type: "handler",
        value:/* js */ `
            try{
                const selectedComponens =  GetVar( "selectedComponents")||[];
                if(selectedComponens.length) {
                    const selectedComponent = selectedComponens[0];
                    const currentComponent = GetComponent(selectedComponent, GetVar("currentEditingApplication").uuid)
                    let state='enabled';
                    if(currentComponent.styleHandlers && currentComponent.styleHandlers['--hybrid-input-helper-text-color']){
                        state='disabled'
                    }
                    return state;
                }

            }catch(e){
                console.log(e);
            }
            `
      }
    }
  },
  {
    uuid: "input_helper_color_handler_block",
    applicationId: "1",
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
    applicationId: "1",
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
            try{
                const selectedComponens =  GetVar( "selectedComponents")||[];
                if( selectedComponens.length) {
                const selectedComponent = selectedComponens[0];
                const currentComponent = GetComponent(selectedComponent, GetVar("currentEditingApplication").uuid)    
                helperColorHandler= currentComponent?.styleHandlers && currentComponent?.styleHandlers['--hybrid-input-helper-text-color'] || ''  
                }
            }catch(error){
                console.log(error);
            }
            return [parameter,helperColorHandler];
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
                updateStyleHandlers(currentComponent,'--hybrid-input-helper-text-color',EventData.value)
            }
        }catch(error){
            console.log(error);
        }
  `
    }
  }
];
