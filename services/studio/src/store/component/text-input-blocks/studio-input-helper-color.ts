import { ComponentType } from "../interface";
import { COMMON_ATTRIBUTES } from "../helper/common_attributes";
export default [
    {
    uuid: "input_helper_color_block",
    applicationId: "1",
    name: "input helper color block",
    component_type: ComponentType.VerticalContainer,
    ...COMMON_ATTRIBUTES,
    style: {
        width: "70px",
        display: 'flex',
        "flex-direction": "column",
    },
    childrenIds: ["input_helper_color_label", "helper_color_input"]
    },
    {
        uuid: "input_helper_color_label",
        name: "input helper color label",
        component_type: ComponentType.TextLabel,
        applicationId: "1",
        ...COMMON_ATTRIBUTES,
        input: {
            value: {
                type: 'handler',
                value: /* js */`
                const label ='Helper color';
                label;`
            }
        },
        style: {
            width:"100px",
            display:'block'
        },
    },
{
    uuid: "helper_color_input",
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
                updateStyle(currentComponent, "--hybrid-input-helper-text-color", EventData.value);
            
            }
        }catch(error){
            console.log(error);
        }
        
  `
    },
    ...COMMON_ATTRIBUTES,
   style:{
    width:"50px",
    display:'block'
   },
    input: {
        value: {
            type: "handler",
            value: /* js */`
                try{
                    const selectedComponens =  GetVar( "selectedComponents")||[];
                    if( selectedComponens.length) {
                        const selectedComponent = selectedComponens[0];
                        const currentComponent = GetComponent(selectedComponent, GetVar("currentEditingApplication").uuid)
                        if(currentComponent?.style)
                        currentComponent.style['--hybrid-input-helper-text-color'];
                    }

                }catch(e){
                    console.log(e);
                }
            `
        }
    }
}
] 
