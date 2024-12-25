import { ComponentType } from "$store/component/interface.ts";
import { COMMON_ATTRIBUTES } from "../../../../helper/common_attributes.ts";
import { InputBlockContainerTheme, SelectTheme } from "../../../utils/common-editor-theme.ts";

export default [
  {
    uuid: "datepicker_format_block",
    applicationId: "1",
    name: "datepicker format block",
    component_type: ComponentType.VerticalContainer,
    styleHandlers: {},
    input: {
      direction: "vertical"
    },
    ...COMMON_ATTRIBUTES,
    style: {
      ...InputBlockContainerTheme
    },

    childrenIds: ["datepicker_input_block", "format_handler_block"]
  },
  {
    uuid: "datepicker_input_block",
    applicationId: "1",
    name: "datepicker input block",
    component_type: ComponentType.VerticalContainer,
    ...COMMON_ATTRIBUTES,
    style: {
      display: "flex",
      "align-items": "center",
      "justify-content": "space-between"
    },
    childrenIds: ["datepicker_format_label", "datepicker_format_content_container"]
  },

  {
    uuid: "datepicker_format_label",
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
               const label ='Format';
             return label;
            `
      }
    }
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
                let format = currentComponent.input?.format?.value??'DD/MM/YYYY';
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
                if(currentComponent.input?.format?.type =="handler" && currentComponent.input?.format?.value){
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
                    const formatValue = EventData.value?EventData.value:'DD/MM/YYYY'
                    updateInput(currentComponent, "format","string",formatValue);
        
                }
            }catch(error){
                console.log(error);
            }
            
      `
    }
  },
  {
    uuid: "format_handler_block",
    applicationId: "1",
    name: "format handler block",
    component_type: ComponentType.VerticalContainer,
    ...COMMON_ATTRIBUTES,
    style: {
      "margin-top": "10px",
      display: "flex",
      "justify-content": "space-between"
    },

    childrenIds: ["datepicker_format_select", "format_handler"]
  },
  {
    uuid: "format_handler",
    applicationId: "1",
    component_type: ComponentType.Event,
    ...COMMON_ATTRIBUTES,
    styleHandlers: {},
    name: "format handler",
    style: {
      display: "block",
      width: "250px"
    },
    input: {
      value: {
        type: "handler",
        value: /* js */`
                const parameter ='format';
                let formatHandler=''
                try{
                    const selectedComponens =  GetVar( "selectedComponents")||[];
                    if( selectedComponens.length) {
                        const selectedComponent = selectedComponens[0];
                        let currentComponent = GetComponent(selectedComponent, GetVar("currentEditingApplication").uuid)
                        if(currentComponent?.input?.format?.type =='handler' && currentComponent?.input?.format?.value){
                            formatHandler = currentComponent?.input?.format?.value
                        }
                    }
                }catch(error){
                    console.log(error);
                }
                return [parameter,formatHandler];
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
                    if(EventData.value != currentComponent?.input?.format?.value)
                    updateInput(currentComponent,'format','handler',EventData.value);
                }
            }catch(error){
                console.log(error);
            }
      `
    }
  }

];