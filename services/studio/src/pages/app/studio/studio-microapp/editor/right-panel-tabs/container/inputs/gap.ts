import { ComponentType } from "$store/component/interface.ts";
import { COMMON_ATTRIBUTES } from "../../../../helper/common_attributes.ts";
import { InputBlockContainerTheme } from "../../../utils/common-editor-theme.ts";

export const StudioContainerGapInput =  [
  {
    uuid: "gap_vertical_container",
    applicationId: "1",
    name: "gap vertical container",
    component_type: ComponentType.Container,
    ...COMMON_ATTRIBUTES,
    style: {
      ...InputBlockContainerTheme
    },
    childrenIds: [
      "gap_label",

      "gap_handler_block",
      ]
  },
  {
    uuid: "gap_handler_block",
    applicationId: "1",
    name: "placeholder block",
    component_type: ComponentType.Container,
    ...COMMON_ATTRIBUTES,
    style: {
      display: "flex",
      "align-items": "center",
      "justify-content": "space-between"
    },
    childrenIds: ["gap_input","gap_handler"]
  },
  {
    uuid: "gap_label",
    name: "gap label",
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
                return 'Gap';
            `
      }
    }

  },
  {
    uuid: "gap_input",
    name: "gap input",
    applicationId: "1",
    component_type: ComponentType.NumberInput,
    ...COMMON_ATTRIBUTES,
    style: {
      display: "block",
      width: "153px",
      size: "small"
    },
    event: {
      valueChange:
      /* js */ `
                    try{
                        const selectedComponens =  GetVar( "selectedComponents")||[];
                        if( selectedComponens.length) {
                            const selectedComponent = selectedComponens[0];
                            const currentComponent = GetComponent(selectedComponent, GetVar("currentEditingApplication").uuid)
                            updateStyle(currentComponent, "gap",EventData.value+'px');
                        }
                    }catch(error){
                        console.log(error);
                    }         `

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
                const height = currentComponent?.style&&currentComponent.style['gap']||0;
                return height;
                
            }

        }
         catch(e){
             console.log(e);
          }
            `
      },
      state: {
        type: "handler",
        value: /* js */`
            try{
            const selectedComponens =  GetVar( "selectedComponents")||[];
            if( selectedComponens.length) {
                const selectedComponent = selectedComponens[0];
                const currentComponent = GetComponent(selectedComponent, GetVar("currentEditingApplication").uuid)
                let state ='enabled'
                if(currentComponent?.styleHandlers && currentComponent?.styleHandlers['height']){
                  state ='disabled'
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
    uuid: "gap_handler",
    applicationId: "1",
    component_type: ComponentType.Event,
    ...COMMON_ATTRIBUTES,
    styleHandlers: {},
    name: "gap handler",
    style: {
      display: "block"
    },
    input: {
      value: {
        type: "handler",
        value: /* js */`
                const parameter ='gap';
                let heightHandler=''
                try{
                    const selectedComponens =  GetVar( "selectedComponents")||[];
                    if( selectedComponens.length) {
                    const selectedComponent = selectedComponens[0];
                    const currentComponent = GetComponent(selectedComponent, GetVar("currentEditingApplication").uuid)    
                    heightHandler = currentComponent?.styleHandlers && currentComponent?.styleHandlers['gap'] || ''  
                    }
                }catch(error){
                    console.log(error);
                }
                return [parameter,heightHandler];
            `
      }
    },

    event: {
      codeChange: /* js */ `
            try{
                const selectedComponens =  GetVar( "selectedComponents")||[];
                if( selectedComponens.length) {
                    const selectedComponent = selectedComponens[0];
                    let currentComponent = GetComponent(selectedComponent, GetVar("currentEditingApplication").uuid)
                    updateStyleHandlers(currentComponent,'height',EventData.value)
                }
            }catch(error){
                console.log(error);
            }
      `
    }
  }


];