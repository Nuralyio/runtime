import { ComponentType } from "../interface";
import { COMMON_ATTRIBUTES } from "../helper/common_attributes";
export default [
    {
        uuid: "button_size_block",
        applicationId: "1",
        name: "button size block",
        component_type: ComponentType.VerticalContainer,
        styleHandlers: {},
        input: {
            direction: "vertical",
        },
        ...COMMON_ATTRIBUTES,
        style: {
            display:'flex',
            'flex-direction':'column'
        },

        childrenIds: ["button_size_label", "button_size_select"],
    },
    
    {
        uuid: "button_size_label",
        name: "button size label",
        component_type: ComponentType.TextLabel,
        applicationId: "1",
        ...COMMON_ATTRIBUTES,
        input:{
            value:{
                type:'handler',
                value:/* js*/ `
                const label = 'Size';
                label;
                `}
        },
        style: {

        }
    },
    {
        uuid: "button_size_select",
        applicationId: "1",
        component_type: ComponentType.RadioButton,
        ...COMMON_ATTRIBUTES,
        styleHandlers: {},
        name: "button size select",
        input: {
            value: {
                type: "handler",
                value: /* js */ ` 
                const selectedComponens =  GetVar( "selectedComponents")||[];
                const selectedComponent = selectedComponens[0];
                const currentComponent = GetComponent(selectedComponent, GetVar("currentEditingApplication").uuid)
                const currentSize = currentComponent.style['size'] || 'default'
                const options = 
                    [
                      {
                         icon: "font-awesome",
                         value: "small"
                      },
                      {
                       icon: "font-awesome",
                       value: "default"
                      },
                      {
                       icon: "font-awesome",
                       value: "large",
                       }, 
            ]   
            const radioType='button'
            const result = [options,currentSize,radioType];
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
                    const sizeValue = EventData.value;
                    updateStyle(currentComponent,'size',sizeValue)
                }
            }catch(error){
                console.log(error);
            }  
      `
        },
    }

]