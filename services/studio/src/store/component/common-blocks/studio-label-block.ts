import { ComponentType } from "../interface";
import { COMMON_ATTRIBUTES } from "../helper/common_attributes";
export default [
    {
        uuid: "label_text_block",
        applicationId: "1",
        name: "label text block",
        component_type: ComponentType.VerticalContainer,
        ...COMMON_ATTRIBUTES,
        style: {
             display:'flex',
             'align-items':'center',
             'justify-content':'space-between',
             width:"330px",
             "margin-top":'10px'
        },

        childrenIds: ["label_text_input_block","label_handler_block"],
    },
    {
        uuid: "label_text_input_block",
        applicationId: "1",
        name: "label input block",
        component_type: ComponentType.VerticalContainer,
        ...COMMON_ATTRIBUTES,
        style: {
            display:'flex',
            'align-items':'center',
            'justify-content':'space-between'
        },
        childrenIds: ["label_text_label", "label_text_input"],
    },
    {
        uuid: "label_text_label",
        name: "label text label",
        component_type: ComponentType.TextLabel,
        applicationId: "1",
        ...COMMON_ATTRIBUTES,
        style:{
            'font-size':'14px',
            'width':'90px'
        },
        input: {
            value: {
                type: 'handler',
                value: /* js */`
               const label ='Label';
             return label;
            `
            }
        },
    },
    {
        uuid: "label_text_input",
        name: "label text input",
        applicationId: "1",
        component_type: ComponentType.TextInput,
        ...COMMON_ATTRIBUTES,
        style: {
            size:"small",
            width:'120px'
        },
        event: {
            valueChange:/* js */ `
                try{
                    const selectedComponens =  GetVar( "selectedComponents")||[];
                    if( selectedComponens.length) {
                        const selectedComponent = selectedComponens[0];
                        const currentComponent = GetComponent(selectedComponent, GetVar("currentEditingApplication").uuid)
                        const newLabelText = EventData.value;
                        updateInput(currentComponent,'label','value',newLabelText);
                    }
                }catch(error){
                    console.log(error);
                } 
  `        
        },
        input: {
            value: {
                type: 'handler',
                value: /* js */`
            try{
            const selectedComponens =  GetVar( "selectedComponents")||[];
            if(selectedComponens.length) {
                const selectedComponent = selectedComponens[0];
                const currentComponent = GetComponent(selectedComponent, GetVar("currentEditingApplication").uuid)                    
                console.log('current component label ',currentComponent)
                if(currentComponent.input?.label?.type=="value"){
                const currentLabel=currentComponent.input?.label?.value??'';
                return currentLabel;
                }
            }

        }catch(e){
            console.log(e);
        }
            `
            },
            state: {
                type: 'handler',
                value: /* js */`
            try{
            const selectedComponens =  GetVar( "selectedComponents")||[];
            if(selectedComponens.length) {
                const selectedComponent = selectedComponens[0];
                const currentComponent = GetComponent(selectedComponent, GetVar("currentEditingApplication").uuid)                    
                let state = "unabled";
                if(currentComponent.input?.label?.type =="handler" && currentComponent.input?.label?.value){
                   state = "disabled"
               }
               return state;
            }

        }catch(e){
            console.log(e);
        }
            `, 
            },
            placeholder: {
                type: 'handler',
                value: /* js */`
                const inputPlaceHolder ="label";
             return  inputPlaceHolder;
            `
            }
        }
    },
    {
        uuid: "label_handler_block",
        applicationId: "1",
        name: "label handler block",
        component_type: ComponentType.VerticalContainer,
        ...COMMON_ATTRIBUTES,
        style: {
            width: "50px",
            display:'flex',
            'justify-content':'space-between',
        },
        
        childrenIds: ["label_handler"],
    },
    {
        uuid: "label_handler",
        applicationId: "1",
        component_type: ComponentType.Event,
        ...COMMON_ATTRIBUTES,
        styleHandlers: {},
        name: "label handler",
        style: {
                display:'block',
        },
        input: { 
            value: {
                type: 'handler',
                value: /* js */`
                const parameter ='label';
                let labelHandler=''
                try{
                    const selectedComponens =  GetVar( "selectedComponents")||[];
                    if( selectedComponens.length) {
                        const selectedComponent = selectedComponens[0];
                        let currentComponent = GetComponent(selectedComponent, GetVar("currentEditingApplication").uuid)
                        if(currentComponent?.input?.label?.type =='handler' && currentComponent?.input?.label?.value){
                            labelHandler = currentComponent?.input?.label?.value
                        }
                    }
                }catch(error){
                    console.log(error);
                }
                return [parameter,labelHandler];
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
                    if(EventData.value != currentComponent?.input?.label?.value)
                    updateInput(currentComponent,'label','handler',EventData.value);
                }
            }catch(error){
                console.log(error);
            }
      `
        },
    },

]