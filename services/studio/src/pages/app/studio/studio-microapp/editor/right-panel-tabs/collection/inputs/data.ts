import { ComponentType } from "$store/component/interface.ts";
import { COMMON_ATTRIBUTES } from "../../../../helper/common_attributes.ts";
import { InputBlockContainerTheme } from "../../../utils/common-editor-theme.ts";

export default [
  {
    uuid: "collection_data",
    applicationId: "1",
    name: "collection_handler_blocks",
    component_type: ComponentType.Container,
    ...COMMON_ATTRIBUTES,
    style: {
      ...InputBlockContainerTheme
    },
    childrenIds: ["collection_handler_label", "collection_event_handler"]
  },
  {
    uuid: "collection_handler_label",
    name: "label image src",
    component_type: ComponentType.TextLabel,
    applicationId: "1",
    ...COMMON_ATTRIBUTES,
    input: {
      value: {
        type: "handler",
        value: /* js */`
               return "Data"
            `
      }
    }
  },
  {
    uuid: "collection_event_handler",
    applicationId: "1",
    component_type: ComponentType.Event,
    ...COMMON_ATTRIBUTES,
    styleHandlers: {},
    name: "label handler",
    style: {
      display: "block",
    },
    input: {
      value: {
        type: "handler",
        value: /* js */`
                const parameter ='data';
                let labelHandler=''
                try{
                    const selectedComponens =  GetVar( "selectedComponents")||[];
                    if( selectedComponens.length) {
                        const selectedComponent = selectedComponens[0];
                        let currentComponent = GetComponent(selectedComponent, GetVar("currentEditingApplication").uuid)
                        console.log(currentComponent)
                        if(currentComponent?.input?.data?.type =='handler' && currentComponent?.input?.data?.value){
                            labelHandler = currentComponent?.input?.data?.value
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
                    if(EventData.value != currentComponent?.input?.data?.value)
                    updateInput(currentComponent,'data','handler',EventData.value);
                }
            }catch(error){
                console.log(error);
            }
      `
    }
  }
];