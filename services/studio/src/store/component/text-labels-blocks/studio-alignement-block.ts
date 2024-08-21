import { ComponentType } from "../interface";
import { COMMON_ATTRIBUTES } from "../helper/common_attributes";
export default [
    {
        uuid: "text_alignement_block",
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

        childrenIds: ["alignement_label_container", "alignement_content_container"],
    },
    {
        uuid: "alignement_label_container",
        applicationId: "1",
        name: "Left panel",
        component_type: ComponentType.VerticalContainer,
        styleHandlers: {},
        input: {
            direction: "vertical",
        },

        ...COMMON_ATTRIBUTES,
        style: {
            width: "250px",
        },
        childrenIds: ["text_label_alignement"],
    },
    {
        uuid: "alignement_content_container",
        applicationId: "1",
        name: "Left panel",
        component_type: ComponentType.VerticalContainer,
        styleHandlers: {},
        input: {
            direction: "vertical",
        },

        ...COMMON_ATTRIBUTES,
        style: {
            width: "280px",
            display: 'flex',
            'justify-content': 'space-between'
        },
        childrenIds: ["text-align-content"],
    },
    {
        uuid: "text_label_alignement",
        name: "text_label",
        component_type: ComponentType.TextLabel,
        applicationId: "1",
        ...COMMON_ATTRIBUTES,
        input: {
            value: {
                type: 'handler',
                value: /* js */`
               const label ='Alignement';
               label;
            `
            }
        },
    },
    {
        uuid: "text-align-content",
        name: "name",
        applicationId: "1",
        component_type: ComponentType.RadioButton,
        styleHandlers: {},
        ...COMMON_ATTRIBUTES,

        input: {
            value: {
                type: "handler",
                value: /* js */ `
                const selectedComponens =  GetVar( "selectedComponents")||[];
                const selectedComponent = selectedComponens[0];
                const currentComponent = GetComponent(selectedComponent, GetVar("currentEditingApplication").uuid)
                let defaultTextAlign = currentComponent.style['text-align'] ||'';
                const options =[{value:'left',icon: "align-left"},
                                {value:'right',icon: "align-right"},
                                {value:'center',icon: "align-center"},
                                {value:'justify',icon: "align-justify"},
                                {value:'top',icon: "arrow-up"},
                                {value:'bottom',icon: "arrow-down"}
                              ]
                const radioType='button';
                const result =[options,defaultTextAlign,radioType];
                result;           
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
                    const textAlignValue = EventData.value?EventData.value:''
                    updateStyle(currentComponent, "text-align", textAlignValue);
                }
            }catch(error){
                console.log(error);
            }  
      `
        },
    },
] 
