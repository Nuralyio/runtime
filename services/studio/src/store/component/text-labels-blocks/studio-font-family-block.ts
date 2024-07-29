import { ComponentType } from "../interface";
import { COMMON_ATTRIBUTES } from "../common_attributes";
export default [
    {
        uuid: "font_family_block",
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

        childrenIds: ["font_family_label_container", "font_family_content_container"],
    },
    {
        uuid: "font_family_label_container",
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
        childrenIds: ["font_family_label"],
    },
    {
        uuid: "font_family_label",
        name: "text_label",
        component_type: ComponentType.TextLabel,
        parameters: {
            value: "Font family",
        },
        applicationId: "1",
        ...COMMON_ATTRIBUTES,
        style: {

        }
    },
    {
        uuid: "font_family_content_container",
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
        childrenIds: ["font_family_select"],
    },
    {
        uuid: "font_family_select",
        applicationId: "1",
        component_type: ComponentType.Select,
        ...COMMON_ATTRIBUTES,
        styleHandlers: {},
        name: "Left panel",
        input: {
            value: {
                type: "handler",
                value: /* js */ ` 
                const selectedComponens =  GetVar( "selectedComponents")||[];
                const selectedComponent = selectedComponens[0];
                const currentComponent = GetComponent(selectedComponent, GetVar("currentEditingApplication").uuid)
                let fontFamily = currentComponent.style['font-family']
                const options = 
                    [[
                    {
                    label: "Arial",
                    value: "arial",
                    }, 
                    {
                    label: "Tahoma",
                    value: "tahoma"
                   },
                    {
                     label: "Verdana",
                     value: "verdana"
                   },
                   {
                    label:'Georgia',
                    value:'georgia'
                  },
                  {
                    label:'Courier New',
                    value:'courier new'
                 }
            
            ],[fontFamily]]
            options
                
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
                    const fontFamilyValue = EventData.value?EventData.value:'initial'
                    updateStyle(currentComponent, "font-family", fontFamilyValue);
        
                }
            }catch(error){
                console.log(error);
            }
            
      `
        },
    }

]