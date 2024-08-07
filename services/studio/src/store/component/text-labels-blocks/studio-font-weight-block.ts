import { ComponentType } from "../interface";
import { COMMON_ATTRIBUTES } from "../helper/common_attributes";
export default [
    {
        uuid: "font_weight_block",
        applicationId: "1",
        name: "Left panel",
        component_type: ComponentType.VerticalContainer,
        styleHandlers: {},
        input: {
            direction: "vertical",
        },

        ...COMMON_ATTRIBUTES,
        style: {
            width: "250px",
            display: 'flex',
            'flex-direction': 'column',
            'margin-top': '10px',
        },
        childrenIds: ["text_label_font_weight", "font_weight_select"],
    },
    {
        uuid: "text_label_font_weight",
        name: "text_label",
        component_type: ComponentType.TextLabel,
        parameters: {
            value: "Font weight",
        },

        applicationId: "1",
        ...COMMON_ATTRIBUTES,
        style:{display:true}
    },
    {
        uuid: "font_weight_select",
        applicationId: "1",
        component_type: ComponentType.Select,
        ...COMMON_ATTRIBUTES,
        styleHandlers: {},
        name: "Left panel",
        input: {
            value: {
                type: "handler",
                value: /* js */ `
                try{
                    const selectedComponens =  GetVar( "selectedComponents")||[];
                    const selectedComponent = selectedComponens[0];
                    const currentComponent = GetComponent(selectedComponent, GetVar("currentEditingApplication").uuid)
                    let fontWeight = currentComponent.style['font-weight'];
                    let selectedFontWeight;
                    const options = [{label: "Normal",value: "normal"},{label:'Bold',value:'bold'},{label:'Extra bold',value:'800'}]
                    if(fontWeight){
                        selectedFontWeight = options.find((option)=> option.value == fontWeight);   
                    }
                    const result = [options,[selectedFontWeight?selectedFontWeight.label:'Normal']]
                    result;
                }
                catch(e){
                    console.log(e)
                }

                
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
                    const fontWeightValue = EventData.value?EventData.value:'initial'
                    updateStyle(currentComponent, "font-weight", fontWeightValue);
        
                }
            }catch(error){
                console.log(error);
            }
            
      `
        },
    },
] 
