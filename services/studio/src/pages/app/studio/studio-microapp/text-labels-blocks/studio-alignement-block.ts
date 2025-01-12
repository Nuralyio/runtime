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
        type: "string",
        value: 'Horizontal alignment'
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
            const selectedComponents = GetVar("selectedComponents") || [];
            const selectedComponent = selectedComponents[0];
        
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
        
            const currentEditingApplication = GetVar("currentEditingApplication");
            const currentComponent = GetComponent(selectedComponent, currentEditingApplication?.uuid);
        
            if (!currentComponent) {
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
        
            const hasJustifyContentHandler = currentComponent.styleHandlers?.['justify-content'];
            const defaultTextAlign = hasJustifyContentHandler
                ? ''
                : currentComponent.style?.['justify-content'] || 'start';
        
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
