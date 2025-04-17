import { ComponentType } from "$store/component/interface.ts";
import { COMMON_ATTRIBUTES } from "../../../../helper/common_attributes.ts";
import { InputBlockContainerTheme, SelectTheme } from "../../../utils/common-editor-theme.ts";

export default [
  {
    uuid: "datepicker_locale_block",
    application_id: "1",
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
    application_id: "1",
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
    application_id: "1",
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
    application_id: "1",
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
    application_id: "1",
    component_type: ComponentType.Select,
    ...COMMON_ATTRIBUTES,
    styleHandlers: {},
    name: "locale select",
    input: {
      value: {
        type: "handler",
        value: /* js */ ` 
                const selectedComponent = Utils.first(Vars.selectedComponents);
                
                
                let locale = selectedComponent.input?.locale?.value??'en';
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
            
            const selectedComponent = Utils.first(Vars.selectedComponents);
            if(true) {
                
                                    
                let state = "unabled";
                if(selectedComponent.input?.locale?.type =="handler" && selectedComponent.input?.locale?.value){
                   state = "disabled"
               }
               return state;
             }

        
            `
      }
    },
    style: {
      ...SelectTheme
    },
    event: {
      changed: /* js */ `

            
                const selectedComponent = Utils.first(Vars.selectedComponents);
                    const localeValue = EventData.value?EventData.value:'en'
                    updateInput(selectedComponent, "locale", 'string',localeValue);
            
            
      `
    }
  },
  {
    uuid: "locale_handler_block",
    application_id: "1",
    name: "locale handler block",
    component_type: ComponentType.Container,
    ...COMMON_ATTRIBUTES,
    style: {},

    childrenIds: ["locale_select", "locale_handler"]
  },
  {
    uuid: "locale_handler",
    application_id: "1",
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
                
                    const selectedComponent = Utils.first(Vars.selectedComponents);
                        
                        if(selectedComponent.input?.locale?.type =='handler' && selectedComponent.input?.locale?.value){
                            localeHandler = selectedComponent.input?.locale?.value
                        }
                
                return [parameter,localeHandler];
            `
      }
    },

    event: {
      codeChange: /* js */ `
            
                const selectedComponent = Utils.first(Vars.selectedComponents);
                    
                    
                    if(EventData.value != selectedComponent.input?.locale?.value)
                    updateInput(selectedComponent,'locale','handler',EventData.value);
            
      `
    }
  }

];