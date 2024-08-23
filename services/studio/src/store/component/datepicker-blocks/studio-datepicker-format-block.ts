import { ComponentType } from "../interface";
import { COMMON_ATTRIBUTES } from "../helper/common_attributes";
export default [
    {
        uuid: "datepicker_format_block",
        applicationId: "1",
        name: "datepicker format block",
        component_type: ComponentType.VerticalContainer,
        styleHandlers: {},
        input: {
            direction: "vertical",
        },
        ...COMMON_ATTRIBUTES,
        style: {
        

        },

        childrenIds: ["datepicker_format_label_container", "datepicker_format_content_container"],
    },
    {
        uuid: "datepicker_format_label_container",
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
        childrenIds: ["datepicker_format_label"],
    },
    {
        uuid: "datepicker_format_label",
        name: "text_label",
        component_type: ComponentType.TextLabel,
        applicationId: "1",
        ...COMMON_ATTRIBUTES,
        input: {
            value: {
                type: 'handler',
                value: /* js */`
               const label ='Format';
               label;
            `
            }
        }
    },
    {
        uuid: "datepicker_format_content_container",
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
        childrenIds: ["datepicker_format_select"],
    },
    {
        uuid: "datepicker_format_select",
        applicationId: "1",
        component_type: ComponentType.Select,
        ...COMMON_ATTRIBUTES,
        styleHandlers: {},
        name: "label datepicker format select",
        input: {
            value: {
                type: "handler",
                value: /* js */ ` 
                const selectedComponens =  GetVar( "selectedComponents")||[];
                const selectedComponent = selectedComponens[0];
                const currentComponent = GetComponent(selectedComponent, GetVar("currentEditingApplication").uuid)
                let format = currentComponent.input.format?.value??'DD/MM/YYYY';
                let selectedFormat;
                const options = 
                    [
                    {
                    label: "dd/mm/yyyy",
                    value: "DD/MM/YYYY",
                    }, 
                    {
                    label: "mm/dd/yyyyy",
                    value: "MM/DD/YYYY"
                   },
                    {
                     label: "yyyy/mm/dd",
                     value: "YYYY/MM/DD"
                   },            
            ]
            if(format){
                selectedFormat = options.find((option)=> option.value == format);   
            }
            const result =[options,[selectedFormat? selectedFormat.label : ""]]
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
                    const formatValue = EventData.value?EventData.value:'DD/MM/YYYY'
                    updateInput(currentComponent, "format","string",formatValue);
        
                }
            }catch(error){
                console.log(error);
            }
            
      `
        },
    }

]