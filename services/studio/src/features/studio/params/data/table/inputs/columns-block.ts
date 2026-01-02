import { COMMON_ATTRIBUTES } from "../../../../core/helpers/common_attributes.ts";

export default [
  {
    uuid: "table_columns_block",
    application_id: "1",
    name: "table columns block",
    type: "container",
    ...COMMON_ATTRIBUTES,
    style: {
      display: "flex",
      "flex-direction": "column"
    },

    children_ids: ["table_column_label", "table_columns_select", "font_family_block", "font_size_vertical_container"]
  },

  {
    uuid: "table_column_label",
    name: "button type label",
    type: "text_label",
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
    type: "select",
    name: "Columns",
    input: {
      type: {
        type: "string",
        value: "multiple"
      },
      value: {
        type: "handler",
        value: /* js */ ` 
                const selectedComponent = Utils.first($selectedComponents);
                
                
                let fontFamily = selectedComponent.style['font-family'];
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

            
                const selectedComponent = Utils.first($selectedComponents);
                    
                    
                    const fontFamilyValue = EventData.value?EventData.value:'initial'
                    updateStyle(selectedComponent, "font-family", fontFamilyValue);
        
            
            
      `
    }
  }

];