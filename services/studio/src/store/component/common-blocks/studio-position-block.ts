import { ComponentType } from "../interface";
import { COMMON_ATTRIBUTES } from "../helper/common_attributes";
export default [
    {
        uuid: "position_block",
        applicationId: "1",
        name: "position block",
        component_type: ComponentType.VerticalContainer,
        ...COMMON_ATTRIBUTES,
        style: {
            display:'flex',
            'flex-direction':'column'
        },

        childrenIds: ["position_label", "position_select","position_values"],
    },
    
    {
        uuid: "position_label",
        name: "position label",
        component_type: ComponentType.TextLabel,
        applicationId: "1",
        ...COMMON_ATTRIBUTES,
        input:{
            value:{
                type:'handler',
                value:/* js */`
                const positionLabel='Position';
                positionLabel;
                
                `
            }
        },
        style: {

        }
    },
    {
        uuid: "position_select",
        applicationId: "1",
        component_type: ComponentType.RadioButton,
        ...COMMON_ATTRIBUTES,
        styleHandlers: {},
        name: "position select",
        input: {
            value: {
                type: "handler",
                value: /* js */ ` 
                const selectedComponens =  GetVar( "selectedComponents")||[];
                const selectedComponent = selectedComponens[0];
                const currentComponent = GetComponent(selectedComponent, GetVar("currentEditingApplication").uuid)
                const currentPosition = currentComponent?.style['position'] || 'static'
                const options = 
                    [
                    {
                    label: "Relative",
                    value: "relative",
                    }, 
                    {
                    label: "Absolute",
                    value: "absolute"
                   },
                    {
                     label: "Fixed",
                     value: "fixed"
                   },
                   {
                    label: "Sticky",
                    value: "sticky"
                   },
                   {
                    label: "Static",
                    value: "static"
                   },
            ]   
            const radioType ='button'
            const result = [options,currentPosition,radioType];
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
                    const positionValue = EventData.value;
                    updateStyle(currentComponent,'position',positionValue)
                }
            }catch(error){
                console.log(error);
            }  
      `
        },
    },
    {
        uuid: "position_values",
        applicationId: "1",
        name: "position x axis",
        component_type: ComponentType.VerticalContainer,
        ...COMMON_ATTRIBUTES,
        style: {
            display:"flex",
            "align-items":"center",
            gap:"10px",
            "margin-top":"10px"
        },
        childrenIds: ["top_label", "top_input","left_label","left_input"],
    },
    {
        uuid: "top_label",
        name: "top label",
        component_type: ComponentType.TextLabel,
        applicationId: "1",
        ...COMMON_ATTRIBUTES,
        input: {
            value: {
                type: 'handler',
                value: /* js */`
                const label ='T';
                label;
            `
            }
        },
      
    },
    {
        uuid: "top_input",
        name: "top input",
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
                            updateStyle(currentComponent, "top",EventData.value+'px');
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
                const topValue = currentComponent?.style&&currentComponent.style['top']||0;
                topValue;
                
            }

        }catch(e){
            console.log(e);
        }
            `
            }
        }
    },
    {
        uuid: "left_label",
        name: "left label",
        component_type: ComponentType.TextLabel,
        applicationId: "1",
        ...COMMON_ATTRIBUTES,
        input: {
            value: {
                type: 'handler',
                value: /* js */`
                const label ='L';
                label;
            `
            }
        },
      
    },
    {
        uuid: "left_input",
        name: "left input",
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
                            updateStyle(currentComponent, "left",EventData.value+'px');
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
                const leftValue = currentComponent?.style&&currentComponent.style['left']||0;
                leftValue;
                
            }

        }catch(e){
            console.log(e);
        }
            `
            }
        }
    },
    


]