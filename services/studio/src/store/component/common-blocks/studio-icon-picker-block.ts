import { ComponentType } from "../interface";
import { COMMON_ATTRIBUTES } from "../helper/common_attributes";
export default [
    {
        uuid: "icon_picker_block",
        applicationId: "1",
        name: "icon picker block",
        component_type: ComponentType.VerticalContainer,
        ...COMMON_ATTRIBUTES,
        style: {
            display:'flex',
            'flex-direction':'column'
        },

        childrenIds: ["icon_picker_label", "icon_picker_content"],
    },
    
    {
        uuid: "icon_picker_label",
        name: "icon picker label",
        component_type: ComponentType.TextLabel,
        applicationId: "1",
        ...COMMON_ATTRIBUTES,
        input:{
            value:{
                type:'handler',
                value:/* js */`
                const iconLabel='Icon';
                iconLabel;
                
                `
            }
        },
        style: {

        }
    },
    {
        uuid: "icon_picker_content",
        applicationId: "1",
        component_type: ComponentType.IconPicker,
        ...COMMON_ATTRIBUTES,
        styleHandlers: {},
        name: "icon picker content",
        input: {
            value: {
                type: "handler",
                value: /* js */ ` 
                const selectedComponens =  GetVar( "selectedComponents")||[];
                const selectedComponent = selectedComponens[0];
                const currentComponent = GetComponent(selectedComponent, GetVar("currentEditingApplication").uuid)
                const currentIcon = currentComponent.input?.icon?.value;
                currentIcon;
                `
            },
            placeholder: {
                type: "handler",
                value: /* js */ ` 
                const placeholder ='choose an icon';
                placeholder;
                `
            },
        },
       
        event: {
            iconChanged: /* js */ `
            try{
                const selectedComponens =  GetVar( "selectedComponents")||[];
                if( selectedComponens.length) {
                    const selectedComponent = selectedComponens[0];
                    const currentComponent = GetComponent(selectedComponent, GetVar("currentEditingApplication").uuid)
                    const iconValue = EventData.value;
                    updateInput(currentComponent,'icon','string',iconValue)
                }
            }catch(error){
                console.log(error);
            }  
      `
        },
    }

]