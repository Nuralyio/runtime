import { ComponentType } from "$store/component/interface.ts";
import { COMMON_ATTRIBUTES } from "../../../../helper/common_attributes.ts";
import { InputBlockContainerTheme, SelectTheme } from "../../../utils/common-editor-theme.ts";

export default [
  {
    uuid: "datepicker_locale_block",
    applicationId: "1",
    name: "datepicker locale  block",
    component_type: ComponentType.Container,
    styleHandlers: {},
    input: {
      direction: "vertical"
    },
    ...COMMON_ATTRIBUTES,
    style: {
      ...InputBlockContainerTheme
    },

    childrenIds: ["datepicker_local_input_block", "locale_handler_block"]
  },
  {
    uuid: "datepicker_local_input_block",
    applicationId: "1",
    name: "datepicker local input block",
    component_type: ComponentType.Container,
    ...COMMON_ATTRIBUTES,
    style: {
      display: "flex",
      "align-items": "center",
      "justify-content": "space-between"
    },
    childrenIds: ["datepicker_locale_label_container"]
  },
  {
    uuid: "datepicker_locale_label_container",
    applicationId: "1",
    name: "Left panel",
    component_type: ComponentType.Container,
    styleHandlers: {},
    input: {
      direction: "vertical"
    },

    ...COMMON_ATTRIBUTES,
    style: {},
    childrenIds: ["locale_label"]
  },
  {
    uuid: "locale_label",
    name: "text_label",
    component_type: ComponentType.TextLabel,
    applicationId: "1",
    ...COMMON_ATTRIBUTES,
    style: {
      width: "90px;"
    },
    input: {
      value: {
        type: "handler",
        value: /* js */`
               const label ='Language';
             return label;
            `
      }
    }
  },

  {
    uuid: "locale_select",
    applicationId: "1",
    component_type: ComponentType.Select,
    ...COMMON_ATTRIBUTES,
    styleHandlers: {},
    name: "locale select",
    input: {
      value: {
        type: "handler",
        value: /* js */ ` 
                const selectedComponens =  GetVar( "selectedComponents")||[];
                const selectedComponent = selectedComponens[0];
                const currentComponent = GetComponent(selectedComponent, GetVar("currentEditingApplication").uuid)
                let locale = currentComponent.input?.locale?.value??'en';
                let selectedLocale;
                const options = 
                    [
                    {
                    label: "English",
                    value: "en",
                    }, 
                    {
                    label: "French",
                    value: "fr"
                   },
                    {
                     label: "Arabic",
                     value: "ar"
                   },
                   {
                    label:'Espagnol',
                    value:'es'
                  },
                  {
                    label:'Chinese',
                    value:'zh'
                 }
            
            ]
            if(locale){
                selectedLocale = options.find((option)=> option.value == locale);   
            }
            const result =[options,[selectedLocale? selectedLocale.label : ""]]
           return  result;  
                `
      },
      state: {
        type: "handler",
        value: /* js */`
            try{
            const selectedComponens =  GetVar( "selectedComponents")||[];
            if(selectedComponens.length) {
                const selectedComponent = selectedComponens[0];
                const currentComponent = GetComponent(selectedComponent, GetVar("currentEditingApplication").uuid)                    
                let state = "unabled";
                if(currentComponent.input?.locale?.type =="handler" && currentComponent.input?.locale?.value){
                   state = "disabled"
               }
               return state;
             }

        }catch(e){
            console.log(e);
        }
            `
      }
    },
    style: {
      ...SelectTheme
    },
    event: {
      changed: /* js */ `

            try{
                const selectedComponens =  GetVar( "selectedComponents")||[];
                if( selectedComponens.length) {
                    const selectedComponent = selectedComponens[0];
                    const currentComponent = GetComponent(selectedComponent, GetVar("currentEditingApplication").uuid)
                    const localeValue = EventData.value?EventData.value:'en'
                    updateInput(currentComponent, "locale", 'string',localeValue);
        
                }
            }catch(error){
                console.log(error);
            }
            
      `
    }
  },
  {
    uuid: "locale_handler_block",
    applicationId: "1",
    name: "locale handler block",
    component_type: ComponentType.Container,
    ...COMMON_ATTRIBUTES,
    style: {},

    childrenIds: ["locale_select", "locale_handler"]
  },
  {
    uuid: "locale_handler",
    applicationId: "1",
    component_type: ComponentType.Event,
    ...COMMON_ATTRIBUTES,
    styleHandlers: {},
    name: "locale handler",
    style: {
      display: "block"
    },
    input: {
      value: {
        type: "handler",
        value: /* js */`
                const parameter ='locale';
                let localeHandler=''
                try{
                    const selectedComponens =  GetVar( "selectedComponents")||[];
                    if( selectedComponens.length) {
                        const selectedComponent = selectedComponens[0];
                        let currentComponent = GetComponent(selectedComponent, GetVar("currentEditingApplication").uuid)
                        if(currentComponent?.input?.locale?.type =='handler' && currentComponent?.input?.locale?.value){
                            localeHandler = currentComponent?.input?.locale?.value
                        }
                    }
                }catch(error){
                    console.log(error);
                }
                return [parameter,localeHandler];
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
                    if(EventData.value != currentComponent?.input?.locale?.value)
                    updateInput(currentComponent,'locale','handler',EventData.value);
                }
            }catch(error){
                console.log(error);
            }
      `
    }
  }

];