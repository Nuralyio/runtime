import { ComponentType } from "../interface";
import { COMMON_ATTRIBUTES } from "../helper/common_attributes";
export default [
    {
        uuid: "datepicker_locale_block",
        applicationId: "1",
        name: "datepicker locale  block",
        component_type: ComponentType.VerticalContainer,
        styleHandlers: {},
        input: {
            direction: "vertical",
        },
        ...COMMON_ATTRIBUTES,
        style: {
        

        },

        childrenIds: ["datepicker_locale_label_container", "datepicker_locale_content_container"],
    },
    {
        uuid: "datepicker_locale_label_container",
        applicationId: "1",
        name: "Left panel",
        component_type: ComponentType.VerticalContainer,
        styleHandlers: {},
        input: {
            direction: "vertical",
        },

        ...COMMON_ATTRIBUTES,
        style: {
        },
        childrenIds: ["locale_label"],
    },
    {
        uuid: "locale_label",
        name: "text_label",
        component_type: ComponentType.TextLabel,
        applicationId: "1",
        ...COMMON_ATTRIBUTES,
        input: {
            value: {
                type: 'handler',
                value: /* js */`
               const label ='Language';
               label;
            `
            }
        }
    },
    {
        uuid: "datepicker_locale_content_container",
        applicationId: "1",
        name: "Left panel",
        component_type: ComponentType.VerticalContainer,
        styleHandlers: {},
        input: {
            direction: "vertical",
        },

        ...COMMON_ATTRIBUTES,
        style: {
        },
        childrenIds: ["locale_select"],
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
            result;  
                `
            }
        },
        style: {
            display:'block',
            width: "350px",
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
        },
    }

]