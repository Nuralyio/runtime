import { ComponentType } from "$store/component/interface.ts";
import { COMMON_ATTRIBUTES } from "../helper/common_attributes.ts";

export default [
  {
    uuid: "font_family_block",
    application_id: "1",
    name: "label family block",
    component_type: ComponentType.Container,
    ...COMMON_ATTRIBUTES,
    style: {
      display: "flex",
      "align-items": "center",
      "justify-content": "space-between",
      "width": "276px"
    },

    childrenIds: ["font_family_label", "font_family_select", "font_family_handler"]
  },
  {
    uuid: "font_family_label",
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
        value: 'Font family'
      }
    }
  },

  {
    uuid: "font_family_select",
    application_id: "1",
    component_type: ComponentType.Select,
    styleHandlers: {},
    name: "label font family select",
    input: {
      placeholder: {
        type: "handler",
        value: /* js*/`
                 return 'Font';
                `
      },
      value: {
        type: "handler",
        value: /* js */ ` 
                const selectedComponens =  GetVar( "selectedComponents")||[];
                const selectedComponent = selectedComponens[0];
                const currentComponent = GetComponent(selectedComponent, GetVar("currentEditingApplication").uuid)
                let fontFamily = currentComponent?.style && currentComponent.style['font-family'];
                let selectedFontFamily;
                const options = 
                    [
                    {
                    label: "Arial",
                    value: "Arial",
                    additionalStyle: {
                      fontFamily: "Arial",
                      fontSize: "17px"
                    }
                    }, 
                    {
                    label: "Tahoma",
                    value: "Tahoma",
                    additionalStyle: {
                        fontFamily: "Tahoma",
                        fontSize: "17px"
                    }
                    },
                    {
                     label: "Verdana",
                     value: "Verdana",
                     additionalStyle: {
                        fontFamily: "Verdana",
                        fontSize: "17px"
                      }
                   },
                   {
                    label:'Georgia',
                    value:'Georgia',
                    additionalStyle: {
                      fontFamily: 'Georgia',
                        fontSize: "17px"
                    }
                  },
                  {
                    label:'Courier New',
                    value:'Courier New',
                    additionalStyle: {
                      fontFamily: 'Courier New',
                        fontSize: "17px"
                    }
                 },
                  {
                    label:'Roboto',
                    value:'"Roboto", sans-serif',
                    additionalStyle: {
                      fontFamily: '"Roboto", sans-serif',
                        fontSize: "17px"
                    }
                 },
                 {
                  label:'Lato',
                  value:'"Lato", sans-serif',
                  additionalStyle: {
                    fontFamily: '"Lato", sans-serif',
                        fontSize: "17px"
                  }
               },
                 {
                  label:'Merriweather',
                  value:'"Merriweather", serif',
                  additionalStyle: {
                    fontFamily: '"Merriweather", serif',
                        fontSize: "17px"
                  }
               },
                 {
                  label:'Aleo',
                  value:'"Aleo", serif',
                  additionalStyle: {
                    fontFamily: '"Aleo", serif',
                        fontSize: "17px"
                  }
               },
                 {
                  label:'mulish',
                  value:'"Mulish", sans-serif',
                  additionalStyle: {
                    fontFamily: '"Mulish", sans-serif',
                        fontSize: "17px"
                  }
               },
                 {
                  label:'Asap Condensed',
                  value:'"Asap Condensed", sans-serif',
                  additionalStyle: {
                    fontFamily: '"Asap Condensed", sans-serif',
                        fontSize: "17px"
                  }
               },
                 {
                  label:'Barlow',
                  value:'"Barlow", sans-serif',
                  additionalStyle: {
                    fontFamily: '"Barlow", sans-serif',
                        fontSize: "17px"
                  }
               }
            
            ]
            if(fontFamily){
                selectedFontFamily = options.find((option)=> option.value == fontFamily);   
            }
            const result =[options,[[selectedFontFamily? selectedFontFamily.value : ""]]]
            return  result;  
                `
      },
      state: {
        type: "handler",
        value: /* js */`
                const selectedComponens =  GetVar( "selectedComponents")||[];
                const selectedComponent = selectedComponens[0];
                const currentComponent = GetComponent(selectedComponent, GetVar("currentEditingApplication").uuid)
                let isDisabled ='enabled';
                if(currentComponent?.styleHandlers && currentComponent?.styleHandlers['font-family']) {
                    isDisabled ='disabled'
                } 
                return isDisabled
                 
                 `
      }
    },
    style: {
      display: "block",
      "--hybrid-select-width": "150px",
      "size": "small"
    },
    event: {
      changed: /* js */ `

            try{
                const selectedComponens =  GetVar( "selectedComponents")||[];
                if( selectedComponens.length) {
                    const selectedComponent = selectedComponens[0];
                    const currentComponent = GetComponent(selectedComponent, GetVar("currentEditingApplication").uuid)
                    const fontFamilyValue = EventData.value?EventData.value:'arial'
                    updateStyle(currentComponent, "font-family", fontFamilyValue);
        
                }
            }catch(error){
                console.log(error);
            }
            
      `
    }
  },

  {
    uuid: "font_family_handler",
    application_id: "1",
    component_type: ComponentType.Event,
    ...COMMON_ATTRIBUTES,
    styleHandlers: {},
    name: "font family handler",
    style: {
      display: "block"
    },
    input: {
      value: {
        type: "handler",
        value: /* js */`
                const parameter ='fontFamily';
                let fontFamilyHandler=''
                try{
                    const selectedComponens =  GetVar( "selectedComponents")||[];
                    if( selectedComponens.length) {
                    const selectedComponent = selectedComponens[0];
                    const currentComponent = GetComponent(selectedComponent, GetVar("currentEditingApplication").uuid)    
                    fontFamilyHandler = currentComponent?.styleHandlers && currentComponent?.styleHandlers['font-family'] || ''  
                    }
                }catch(error){
                    console.log(error);
                }
                return [parameter,fontFamilyHandler];
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
                    updateStyleHandlers(currentComponent,'font-family',EventData.value)
                }
            }catch(error){
                console.log(error);
            }
      `
    }
  }

];