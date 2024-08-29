import { ComponentType } from "../interface";
import { COMMON_ATTRIBUTES } from "../helper/common_attributes";
export default [
    {
    uuid: "icon_color_block",
    applicationId: "1",
    name: "icon color block",
    component_type: ComponentType.VerticalContainer,
    ...COMMON_ATTRIBUTES,
    style: {
        width: "250px",
        display: 'flex',
        "flex-direction": "column",
    },
    childrenIds: ["icon_color_label", "icon_color_input"]
    },
    {
        uuid: "icon_color_label",
        name: "icon color label",
        component_type: ComponentType.TextLabel,
        applicationId: "1",
        ...COMMON_ATTRIBUTES,
        input: {
            value: {
                type: 'handler',
                value: /* js */`
                const label ='Color';
                label;`
            }
        },
        style: {},
    },
{
    uuid: "icon_color_input",
    name: "name",
    applicationId: "1",
    component_type: ComponentType.ColorPicker,
    event: {
        valueChange: /* js */ `
       
       try{
            const selectedComponens =  GetVar( "selectedComponents")||[];
            if( selectedComponens.length) {
                const selectedComponent = selectedComponens[0];
                const currentComponent = GetComponent(selectedComponent, GetVar("currentEditingApplication").uuid)
                updateStyle(currentComponent, "--hybrid-icon-color", EventData.value);
            
            }
        }catch(error){
            console.log(error);
        }
        
  `
    },
    ...COMMON_ATTRIBUTES,
    input: {
        value: {
            type: "handler",
            value: /* js */`
                try{
                    const selectedComponens =  GetVar( "selectedComponents")||[];
                    if( selectedComponens.length) {
                        const selectedComponent = selectedComponens[0];
                        const currentComponent = GetComponent(selectedComponent, GetVar("currentEditingApplication").uuid)
                        const currentColor = currentComponent.style['--hybrid-icon-color'] ;
                        currentColor;
                    }

                }catch(e){
                    console.log(e);
                }
            `
        }
    }
}
] 
