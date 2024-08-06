import { ComponentType } from "../interface";
import { COMMON_ATTRIBUTES } from "../helper/common_attributes";
export default [
    {
        uuid: "box_shadow_block",
        name: "name",
        applicationId: "1",
        component_type: ComponentType.ShadowBox,
        styleHandlers: {},
        ...COMMON_ATTRIBUTES,
        event: {
            boxShadowChanged: {
                type: "handler",
                value: /* js */ `
                    try{
                        const selectedComponens =  GetVar( "selectedComponents")||[];
                        if( selectedComponens.length) {
                            const selectedComponent = selectedComponens[0];
                            const currentComponent = GetComponent(selectedComponent, GetVar("currentEditingApplication").uuid)
                            updateStyle(currentComponent, "box-shadow",EventData.value);
                        
                        }
                    }catch(error){
                        console.log(error);
                    }      
  `
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
                if (currentComponent.style["box-shadow"]) {
                    console.log('box shadow values ',currentComponent.style["box-shadow"])
                    const values = currentComponent.style["box-shadow"].match(/-?\d+px/g);  
                    console.log('values ',values)                  
                    const horizontalValue = parseInt(values[0], 10);
                    const verticalValue = parseInt(values[1], 10);
                    const blurValue = parseInt(values[2], 10);
                    const spreadValue = parseInt(values[3], 10);
                    const colorMatch = currentComponent.style["box-shadow"].match(/#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})/);
                    const insetMatch = currentComponent.style["box-shadow"].match(/\binset\b/);
                    const insetValue = insetMatch[0] ? true : false;
                    const colorValue = colorMatch ? colorMatch[0] : "#000000";
                    [horizontalValue,verticalValue,blurValue,spreadValue,insetValue,colorValue]

                }
                else {
                    const horizontalValue = 0;
                    const verticalValue = 0;
                    const blurValue = 0;
                    const spreadValue = 0;
                    const colorValue = "#000000";
                    const insetValue = false;
                    [horizontalValue,verticalValue,blurValue,spreadValue,insetValue,colorValue]
                }
                
            }

        }catch(e){
            console.log(e);
        }
            `
            }
        }
    }

]