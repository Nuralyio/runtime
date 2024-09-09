import { ComponentType } from "../interface";
import { COMMON_ATTRIBUTES } from "../helper/common_attributes";
export default [
    {
        uuid: "height_vertical_container",
        applicationId: "1",
        name: "height vertical container",
        component_type: ComponentType.VerticalContainer,
        ...COMMON_ATTRIBUTES,
        style: {
            width: "250px",
            "margin-top":'10px'
        },
        childrenIds: ["height_block","auto_height_block"],
    },
    {
        uuid: "height_block",
        applicationId: "1",
        name: "height block",
        component_type: ComponentType.VerticalContainer,
        ...COMMON_ATTRIBUTES,
        style: {
            width: "250px",
            display:'flex',
            'flex-direction':'column'
        },
        childrenIds: ["height_label", "height_container"],
    },
    {
        uuid: "height_container",
        name: "height container",
        component_type: ComponentType.VerticalContainer,
        applicationId: "1",
        ...COMMON_ATTRIBUTES,
        style:{
            display:'flex',
            "align-items":'center'
        },
        childrenIds: ["height_input","auto_height_checkbox"],

    },

    {
        uuid: "height_label",
        name: "height label",
        component_type: ComponentType.TextLabel,
        applicationId: "1",
        ...COMMON_ATTRIBUTES,
        input: {
            value: {
                type: 'handler',
                value: /* js */`
                const label ='Height';
                label;
            `
            }
        },
      
    },
    {
        uuid: "height_input",
        name: "height input",
        applicationId: "1",
        component_type: ComponentType.NumberInput,
        ...COMMON_ATTRIBUTES,
        style: {
            display:'block',
            width: "120px",
        },
        event: {
            valueChange: {
                type: "handler",
                value: /* js */ `
                    try{
                        const selectedComponens =  GetVar( "selectedComponents")||[];
                        if( selectedComponens.length) {
                            const selectedComponent = selectedComponens[0];
                            const currentComponent = GetComponent(selectedComponent, GetVar("currentEditingApplication").uuid)
                            updateStyle(currentComponent, "height",EventData.value+'px');
                        }
                    }catch(error){
                        console.log(error);
                    }         `
            }
        },
        input: {
            value: {
                type: 'handler',
                value: /* js */`
            try{
            const selectedComponens =  GetVar( "selectedComponents")||[];
            if( selectedComponens.length) {
                const selectedComponent = selectedComponens[0];
                const currentComponent = GetComponent(selectedComponent, GetVar("currentEditingApplication").uuid)
                const height = currentComponent?.style&&currentComponent.style['height']||0;
                height;
                
            }

        }catch(e){
            console.log(e);
        }
            `
            }
        }
    },

    {
        uuid: "auto_height_checkbox",
        name: "auto height checkbox",
        applicationId: "1",
        component_type: ComponentType.Checkbox,
        ...COMMON_ATTRIBUTES,
        style: {
            
        },
        
        input: {
            label: {
                type: 'handler',
                value: /* js */`
              const checkboxLabel ='auto height';
              checkboxLabel;
            `
            },
            checked: {
                type: 'handler',
                value: /* js */`
            try{
            const selectedComponens =  GetVar( "selectedComponents")||[];
            if( selectedComponens.length) {
                const selectedComponent = selectedComponens[0];
                const currentComponent = GetComponent(selectedComponent, GetVar("currentEditingApplication").uuid)
                const autoHeightChecked = currentComponent?.input?.height?.value =='auto'?'check':''
                autoHeightChecked;  
            }

        }catch(e){
            console.log(e);
        }
            `
            }
        },
        event: {
            checkboxChanged:  /* js */ `
                try{
                    const selectedComponens =  GetVar( "selectedComponents")||[];
                    if( selectedComponens.length) {
                        const selectedComponent = selectedComponens[0];
                        const currentComponent = GetComponent(selectedComponent, GetVar("currentEditingApplication").uuid)
                        const autoHeight = EventData.value;
                        updateInput(currentComponent,'height','string',autoHeight?'auto':'');
                    }
                }catch(error){
                    console.log(error);
                }`
        },
    },


]