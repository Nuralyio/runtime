import { ComponentType } from "$store/component/interface.ts";
import { COMMON_ATTRIBUTES } from "../helper/common_attributes.ts";

export default [
  {
    uuid: "text_alignement_block",
    applicationId: "1",
    name: "Left panel",
    component_type: ComponentType.Container,
    ...COMMON_ATTRIBUTES,
    style: {
      display: "flex",
      "align-items": "center",
      "justify-content": "space-between",
      "width": "290px"
    },

    childrenIds: ["text_label_alignement", "text-align-content", "horizontal_alignement_handler"]
  },
  {
    uuid: "text_label_alignement",
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
               return 'Horizontal alignment';
            `
      }
    }
  },
  {
    uuid: "text-align-content",
    name: "name",
    applicationId: "1",
    component_type: ComponentType.RadioButton,
    ...COMMON_ATTRIBUTES,
    style: {
      "--hybrid-button-height": "30px",
      "--hybrid-button-width": "52px"
    },

    input: {
      value: {
        type: "handler",
        value: /* js */ `
                const selectedComponens =  GetVar( "selectedComponents")||[];
                const selectedComponent = selectedComponens[0];
                const currentComponent = GetComponent(selectedComponent, GetVar("currentEditingApplication").uuid)
                let defaultTextAlign='';
                let isDisabled = false;
                if(currentComponent.styleHandlers && currentComponent?.styleHandlers['justify-content']) {
                    isDisabled = true
                }
                else 
                defaultTextAlign = currentComponent.style['justify-content'] ||'start';

                const options =[{value:'start',icon: "align-left",disabled:isDisabled},
                                {value:'center',icon: "align-center",disabled:isDisabled},
                                 {value:'end',icon: "align-right",disabled:isDisabled},
                              ]
                const radioType='button';
                const result =[options,defaultTextAlign,radioType];
                return  result;           
                `
      }
    },
    event: {
      changed: /* js */ `
           try{
                const selectedComponens =  GetVar( "selectedComponents")||[];
                if( selectedComponens.length) {
                    const selectedComponent = selectedComponens[0];
                    const currentComponent = GetComponent(selectedComponent, GetVar("currentEditingApplication").uuid)
                    const currentComponentDisplay = currentComponent.style['display'];
                    const textAlignValue = EventData.value;
                    if(currentComponentDisplay!='flex')
                    updateStyle(currentComponent, "display", 'flex');
                
                    updateStyle(currentComponent, "justify-content", textAlignValue);
                }
            }catch(error){
                console.log(error);
            }  
      `
    }
  },

  {
    uuid: "horizontal_alignement_handler",
    applicationId: "1",
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
                try{
                    const selectedComponens =  GetVar( "selectedComponents")||[];
                    if( selectedComponens.length) {
                    const selectedComponent = selectedComponens[0];
                    const currentComponent = GetComponent(selectedComponent, GetVar("currentEditingApplication").uuid)    
                    horizontalAlignementHandler= currentComponent?.styleHandlers && currentComponent?.styleHandlers['justify-content'] || ''  
                    }
                }catch(error){
                    console.log(error);
                }
                return [parameter,horizontalAlignementHandler];
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
                    const currentComponentDisplay = currentComponent?.style['display'];
                    
                    if(currentComponentDisplay!='flex')
                     updateStyle(currentComponent, "display", 'flex');
                    
                    updateStyleHandlers(currentComponent,'justify-content',EventData.value)
                }
            }catch(error){
                console.log(error);
            }
      `
    }
  }
];
