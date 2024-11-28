import { ComponentType } from "$store/component/interface.ts";
import { COMMON_ATTRIBUTES } from "../helper/common_attributes.ts";
export default [
    {
        uuid: "icon_picker_block",
        applicationId: "1",
        name: "icon picker block",
        component_type: ComponentType.VerticalContainer,
        ...COMMON_ATTRIBUTES,
        style: {
            display:'flex',
            'justify-content':'space-between',
            'align-items':'center',
            

            "margin-top":'10px'
        },

        childrenIds: ["icon_picker_input_block","icon_picker_handler_block"],
    },
    {
        uuid: "icon_picker_input_block",
        applicationId: "1",
        name: "placeholder block",
        component_type: ComponentType.VerticalContainer,
        ...COMMON_ATTRIBUTES,
        style: {
            display:'flex',
            'align-items':'center',
            'justify-content':'space-between'
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
                return iconLabel;
                
                `
            }
        },
        style: {
            width:'90px'

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
                return currentIcon;
                `
            },
            placeholder: {
                type: "handler",
                value: /* js */ ` 
                const placeholder ='choose an icon';
                return placeholder;
                `
            },
            disable:{
                type: "handler",
                value: /* js */ ` 
                const selectedComponens =  GetVar( "selectedComponents")||[];
                const selectedComponent = selectedComponens[0];
                const currentComponent = GetComponent(selectedComponent, GetVar("currentEditingApplication").uuid)
                let disable = false;
                if(currentComponent.input?.icon?.type=="handler" && currentComponent.input?.icon?.value)
                    disable=true;
                return disable;
                `

            }
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
    },
    {
        uuid: "icon_picker_handler_block",
        applicationId: "1",
        name: "icon picker handler block",
        component_type: ComponentType.VerticalContainer,
        ...COMMON_ATTRIBUTES,
        style: {
            width: "50px",
            display:'flex',
            'justify-content':'space-between',
        },
        
        childrenIds: ["icon_picker_handler"],
    },
    {
        uuid: "icon_picker_handler",
        applicationId: "1",
        component_type: ComponentType.Event,
        ...COMMON_ATTRIBUTES,
        styleHandlers: {},
        name: "icon picker handler",
        style: {
                display:'block',
        },
        input: { 
            value: {
                type: 'handler',
                value: /* js */`
                const parameter ='iconPicker';
                let iconPickerHandler=''
                try{
                    const selectedComponens =  GetVar( "selectedComponents")||[];
                    if( selectedComponens.length) {
                        const selectedComponent = selectedComponens[0];
                        let currentComponent = GetComponent(selectedComponent, GetVar("currentEditingApplication").uuid)
                        if(currentComponent?.input?.icon?.type =='handler' && currentComponent?.input?.icon?.value){
                            iconPickerHandler= currentComponent?.input?.icon?.value
                        }
                    }
                }catch(error){
                    console.log(error);
                }
                return [parameter,iconPickerHandler];
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
                    if(EventData.value != currentComponent?.input?.icon?.value)
                    updateInput(currentComponent,'icon','handler',EventData.value);
                }
            }catch(error){
                console.log(error);
            }
      `
        },
    },

]