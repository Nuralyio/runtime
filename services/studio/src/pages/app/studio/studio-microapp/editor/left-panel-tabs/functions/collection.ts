import { ComponentType } from "$store/component/interface.ts";
import { COMMON_ATTRIBUTES } from "../../../helper/common_attributes.ts";

export const StudioFunctionCollection = [

  {
    uuid: "function_micro_app",
    name: "MicroApp",
    component_type: ComponentType.MicroApp,

    input: {
      appUUID: {
        type: "string",
        value: "1"
      },
      componentToRenderUUID: {
        type: "string",
        value: "studio_function_collection"
      },
      mode: {
        type: "string",
        value: "preview"
      }
    },
    applicationId: "1"

  },
 /* {
    uuid:"function_item_container",
    component_type: ComponentType.Container,
    applicationId: "1",
    ...COMMON_ATTRIBUTES,
    style: {
      display: "flex",
      "align-items": "center",
      "justify-content": "space-between",
      "border-bottom": "1px solid #e0e0e0",
      "padding": "10px",
    },
    childrenIds: ["function_icon", 'function_title']
  },*/
  {
    uuid: "function_icon",
    component_type: ComponentType.Icon,
    applicationId: "1",
    ...COMMON_ATTRIBUTES,
    input: {
      icon: {
        type: "handler",
        value: /* js */`
              return 'file-code';
              `
      },
      style: {
        display : 'inline-block',
      }
    },
  },
  {
    uuid: "function_title",
    name: "function_title",
    component_type: ComponentType.TextLabel,
    "event": {
      "onClick": `
      SetVar('currentFunction', Item);
      openEditorTab({ id: Item.id, label: 'Function: ' + Item.label ,type:'function' , detail: { uuid: Item.id, handler : Item.handler} })
      setCurrentEditorTab({ id: Item.id, label: 'Function: ' + Item.label ,type:'function' , detail: { uuid: Item.id, handler : Item.handler} })
      `
    },
    applicationId: "1",
    ...COMMON_ATTRIBUTES,
    input: {
      value: {
        type: "handler",
        value: /* js */`
              return Item.label;`
      }
    },
    style: {
      padding: "10px",
      display: "inline-block",
    }
  },
  {
    uuid: "studio_function_collection",
    applicationId: "1",
    name: "Parent Color Container",
    component_type: ComponentType.Collection,
    ...COMMON_ATTRIBUTES,
    input: {
      "data": {
        "type": "handler",
        "value": `
        return (async () => {

try {
        const response = await fetch('/api/v1/functions', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
        }

        const data = await response.json();
        SetVar('functions', data);
        return data;
    } catch (error) {
        console.error('Error fetching functions:', error);
        throw error; // Re-throw the error so the caller can handle it
    }
    })();

`
      }
    },
    style: {
      display: "flex",
      "flex-direction": "column"
    },
    childrenIds: [
      "function_title",
   ],
  },

];