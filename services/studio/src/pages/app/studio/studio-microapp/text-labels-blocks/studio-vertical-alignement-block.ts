import { ComponentType } from "$store/component/interface.ts";
import { COMMON_ATTRIBUTES } from "../helper/common_attributes.ts";

export default [
  {
    uuid: "text_vertical_alignement_block",
    application_id: "1",
    name: "text vertical alignement block",
    component_type: ComponentType.Container,
    ...COMMON_ATTRIBUTES,
    style: {
      display: "flex",
      "align-items": "center",
      "justify-content": "space-between",
      "width": "290px"
    },

    childrenIds: ["text_label_vertical_alignement", "text_vertical_align_content", "vertical_alignement_handler"]
  },
  {
    uuid: "text_label_vertical_alignement",
    name: "text_label vertical alignement",
    component_type: ComponentType.TextLabel,
    application_id: "1",
    ...COMMON_ATTRIBUTES,
    style: {
      "width": "90px"
    },
    input: {
      value: {
        type: "string",
        value: 'Vertical alignment'
      }
    }
  },
  {
    uuid: "text_vertical_align_content",
    name: "name",
    application_id: "1",
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
               const selectedComponent = Utils.first(Editor.selectedComponents);
                let defaultVerticalAlign='';
                let isDisabled = false;
                if(selectedComponent.styleHandlers && selectedComponent?.styleHandlers['align-items']) {
                    isDisabled = true
                }
                else if ( selectedComponent.style)
                defaultVerticalAlign = selectedComponent.style['align-items'] ||'start';
                const options =[
                                {value:'start',icon: "arrow-up",disabled:isDisabled},
                                {value:'end',icon: "arrow-down",disabled:isDisabled},
                                {value:'center',icon:'align-center',disabled:isDisabled}
                              ]
                const radioType='button';
                const result =[options,defaultVerticalAlign,radioType];
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
                    const verticalAlignValue = EventData.value;
                    if(currentComponentDisplay!='flex')
                    updateStyle(currentComponent, "display", 'flex');
                
                    updateStyle(currentComponent, "align-items", verticalAlignValue);
                }
            }catch(error){
                console.log(error);
            }  
      `
    }
  },
  {
    uuid: "vertical_alignement_handler",
    application_id: "1",
    component_type: ComponentType.Event,
    ...COMMON_ATTRIBUTES,
    styleHandlers: {},
    name: "vertical alignement handler",
    style: {
      display: "block"
    },
    input: {
      value: {
        type: "handler",
        value: /* js */`
                const parameter ='verticalAlignement';
                let verticalAlignementHandler=''
                try{
                    const selectedComponens =  GetVar( "selectedComponents")||[];
                    if( selectedComponens.length) {
                    const selectedComponent = selectedComponens[0];
                    const currentComponent = GetComponent(selectedComponent, GetVar("currentEditingApplication").uuid)    
                    verticalAlignementHandler= currentComponent?.styleHandlers && currentComponent?.styleHandlers['align-items'] || ''  
                    }
                }catch(error){
                    console.log(error);
                }
                return [parameter,verticalAlignementHandler];
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
                    
                    updateStyleHandlers(currentComponent,'align-items',EventData.value)
                }
            }catch(error){
                console.log(error);
            }
      `
    }
  }
];
