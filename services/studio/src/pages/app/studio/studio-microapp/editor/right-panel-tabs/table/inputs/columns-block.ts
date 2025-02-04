import { ComponentType } from "$store/component/interface.ts";
import { COMMON_ATTRIBUTES } from "../../../../helper/common_attributes.ts";

export default [
  {
    uuid: "table_columns_block",
    application_id: "1",
    name: "table columns block",
    component_type: ComponentType.Container,
    ...COMMON_ATTRIBUTES,
    style: {
      display: "flex",
      "flex-direction": "column"
    },

    childrenIds: ["table_column_label", "table_columns_select", "font_family_block", "font_size_vertical_container"]
  },

  {
    uuid: "table_column_label",
    name: "button type label",
    component_type: ComponentType.TextLabel,
    application_id: "1",
    ...COMMON_ATTRIBUTES,
    input: {
      value: {
        type: "handler",
        value:/* js */`
                const typeLabel='Columns';
                return typeLabel;
                
                `
      }
    },
    style: {}
  },
  {
    uuid: "table_columns_select",
    application_id: "1",
    component_type: ComponentType.Select,
    name: "Columns",
    input: {
      type: {
        type: "string",
        value: "multiple"
      },
      value: {
        type: "handler",
        value: /* js */ ` 
                const selectedComponens =  GetVar( "selectedComponents")||[];
                const selectedComponent = selectedComponens[0];
                const currentComponent = GetComponent(selectedComponent, GetVar("currentEditingApplication").uuid)
                let fontFamily = currentComponent?.style['font-family'];
                let selectedFontFamily;
                const options = 
                    [
                    {
                    label: "Id",
                    value: "id",
                    }, 
                    {
                    label: "Status",
                    value: "status"
                   },
                    {
                     label: "Priority",
                     value: "priority"
                   },
                   {
                    label:'Title',
                    value:'title'
                  },
                  {
                    label:'Asignee',
                    value:'asignee'
                 }
            
            ]
     
            const result =[options,[]]
           return  result;  
                `
      }
    },
    style: {
      display: "block",
      width: "350px"
    },
    event: {
      changed: /* js */ `

            try{
                const selectedComponens =  GetVar( "selectedComponents")||[];
                if( selectedComponens.length) {
                    const selectedComponent = selectedComponens[0];
                    const currentComponent = GetComponent(selectedComponent, GetVar("currentEditingApplication").uuid)
                    const fontFamilyValue = EventData.value?EventData.value:'initial'
                    updateStyle(currentComponent, "font-family", fontFamilyValue);
        
                }
            }catch(error){
                console.log(error);
            }
            
      `
    }
  }

];