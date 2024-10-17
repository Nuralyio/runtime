import { ComponentType } from "../interface";
import { COMMON_ATTRIBUTES } from "../helper/common_attributes";
export default [
    {
        uuid: "font_family_block",
        applicationId: "1",
        name: "label family block",
        component_type: ComponentType.VerticalContainer,
        ...COMMON_ATTRIBUTES,
        style: {
            width:"330px",
            display:'flex',
            'justify-content':'space-between',
            'align-items':'center',
            'margin-top': '10px',

        },

        childrenIds: ["font_family_input_block","font_family_handler_block"],
    },
    {
        uuid: "font_family_input_block",
        applicationId: "1",
        name: "font family input block",
        component_type: ComponentType.VerticalContainer,
        ...COMMON_ATTRIBUTES,
        style: {
            display:'flex',
            'align-items':'center',
            'justify-content':'space-between'
        },
        childrenIds: ["font_family_label_container", "font_family_content_container"],
    },

    {
        uuid: "font_family_label_container",
        applicationId: "1",
        name: "Left panel",
        component_type: ComponentType.VerticalContainer,
        ...COMMON_ATTRIBUTES,
        style: {
        },
        childrenIds: ["font_family_label"],
    },
    {
        uuid: "font_family_label",
        name: "text_label",
        component_type: ComponentType.TextLabel,
        applicationId: "1",
        ...COMMON_ATTRIBUTES,
        style:{
       'font-size':'14px',
        width:'90px'
        },
        input: {
            value: {
                type: 'handler',
                value: /* js */`
               const label ='Font family';
             return label;
            `
            }
        }
    },
    {
        uuid: "font_family_content_container",
        applicationId: "1",
        name: "Left panel",
        component_type: ComponentType.VerticalContainer,
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
        name: "label font family select",
        input: {
            placeholder:{
                type:'handler',
                value: /* js*/`
                 const placeholder ='Font';
                 return placeholder;
                `
            },
            value: {
                type: "handler",
                value: /* js */ ` 
                const selectedComponens =  GetVar( "selectedComponents")||[];
                const selectedComponent = selectedComponens[0];
                const currentComponent = GetComponent(selectedComponent, GetVar("currentEditingApplication").uuid)
                let fontFamily = currentComponent?.style && currentComponent.style['font-family'];
                let selectedFontFamily;
                const options = 
                    [
                    {
                    label: "Arial",
                    value: "arial",
                    }, 
                    {
                    label: "Tahoma",
                    value: "tahoma",
                   },
                    {
                     label: "Verdana",
                     value: "verdana",
                   },
                   {
                    label:'Georgia',
                    value:'georgia',
                  },
                  {
                    label:'Courier New',
                    value:'courier new',
                 }
            
            ]
            if(fontFamily){
                selectedFontFamily = options.find((option)=> option.value == fontFamily);   
            }
            const result =[options,[selectedFontFamily? selectedFontFamily.label : ""]]
            return  result;  
                `
            },
            state:{
                type:'handler',
                 value: /* js */`
                const selectedComponens =  GetVar( "selectedComponents")||[];
                const selectedComponent = selectedComponens[0];
                const currentComponent = GetComponent(selectedComponent, GetVar("currentEditingApplication").uuid)
                let isDisabled ='enabled';
                if(currentComponent?.styleHandlers && currentComponent?.styleHandlers['font-family']) {
                    isDisabled ='disabled'
                } 
                return isDisabled
                 
                 `
            }
        },
        style: {
            display:'block',
            "--hybrid-select-width":"120px",
            'size':'small'
        },
        event: {
            changed: /* js */ `

            try{
                const selectedComponens =  GetVar( "selectedComponents")||[];
                if( selectedComponens.length) {
                    const selectedComponent = selectedComponens[0];
                    const currentComponent = GetComponent(selectedComponent, GetVar("currentEditingApplication").uuid)
                    const fontFamilyValue = EventData.value?EventData.value:'arial'
                    updateStyle(currentComponent, "font-family", fontFamilyValue);
        
                }
            }catch(error){
                console.log(error);
            }
            
      `
        },
    },
    {
        uuid: "font_family_handler_block",
        applicationId: "1",
        name: "font family handler block",
        component_type: ComponentType.VerticalContainer,
        ...COMMON_ATTRIBUTES,
        style: {
            width: "50px",
            display:'flex',
            'justify-content':'space-between',
        },
        
        childrenIds: ["font_family_handler"],
    },
    {
        uuid: "font_family_handler",
        applicationId: "1",
        component_type: ComponentType.Event,
        ...COMMON_ATTRIBUTES,
        styleHandlers: {},
        name: "font family handler",
        style: {
                display:'block',
        },
        input: { 
            value: {
                type: 'handler',
                value: /* js */`
                const parameter ='fontFamily';
                let fontFamilyHandler=''
                try{
                    const selectedComponens =  GetVar( "selectedComponents")||[];
                    if( selectedComponens.length) {
                    const selectedComponent = selectedComponens[0];
                    const currentComponent = GetComponent(selectedComponent, GetVar("currentEditingApplication").uuid)    
                    fontFamilyHandler = currentComponent?.styleHandlers && currentComponent?.styleHandlers['font-family'] || ''  
                    }
                }catch(error){
                    console.log(error);
                }
                return [parameter,fontFamilyHandler];
            `
            }
        },
        
        event: {
            codeChange: /* js */ `
            try{
                const selectedComponens =  GetVar( "selectedComponents")||[];
                if(selectedComponens.length) {
                    const selectedComponent = selectedComponens[0];
                    let currentComponent = GetComponent(selectedComponent, GetVar("currentEditingApplication").uuid)
                    updateStyleHandlers(currentComponent,'font-family',EventData.value)
                }
            }catch(error){
                console.log(error);
            }
      `
        },
    },

]