import { ComponentType } from "$store/component/interface.ts";
import { isServer } from "utils/envirement";
let functionAppUUID = "" ;
if(!isServer){
 functionAppUUID = window.__FUNCTION_APP_UUID__;
}
export const StudioFunctionCollection = [
  {
    "name": "function_micro_app",
    "root": true,
    "uuid": "function_micro_app",
    "input": {
      "height": {
        "type": "string",
        "value": ""
      },
      "direction": {
        "type": "string",
        "value": "vertical"
      }
    },
    "style": {
      "height": "643px",
      "display": "flex",
      "box-shadow": " 0px 0px 0px 0px #000000 ",
      "border-radius": "0px",
      "justify-content": "default",
      "align-items": "start"
    },
    "pageId": "4bb2c99e-1615-4bcb-a530-b8038b8edcc8",
    "breakpoints": {
      "430px": {
        "width": "100%"
      },
      "1024px": {
        "width": "80%"
      }
    },
    "childrenIds": [
      "function_micro_app_block",
    ],
    "application_id": "1",
    "component_type": "vertical-container-block"
  },
  {
    application_id: "1",
    uuid: "function_micro_app_block",
    name: "function_micro_app",
    component_type: ComponentType.MicroApp,
    input: {
      appUUID: {
        type: "string",
        value: functionAppUUID
      },
      componentToRenderUUID: {
        type: "string",
        value: "5d05786e-9b57-4c7f-8ae4-b11ac9f5d84c"
      },
      mode: {
        type: "string",
        value: "preview"
      }
    },
  },
  {
    "name": "text_label_3780",
    "uuid": "fb0e5b41-d71b-4a80-927f-bbb6095dd68c",
    "input": {
      "value": {
        "type": "value",
        "value": "No function already created"
      },
      "width": {
        "type": "string",
        "value": ""
      },
      "height": {
        "type": "string",
        "value": ""
      },
      "display": {
        "type": "handler",
        "value": "return Vars.studio_functions?.length == 0"
      }
    },
    "style": {
      "width": "200px",
      "height": "auto",
      "display": "flex",
      "fontSize": "15px",
      "box-shadow": " 0px 0px 0px 0px #000000 ",
      "font-style": "normal",
      "font-weight": "normal",
      "border-radius": "0px",
      "justify-content": "start"
    },
    "pageId": "4bb2c99e-1615-4bcb-a530-b8038b8edcc8",
    "breakpoints": {
      "1024px": {
        "height": "150px"
      }
    },
    "childrenIds": [],
    "application_id": "1",
    "component_type": "text_label"
  },
  {
    "name": "vertical-container-block_3282",
    "uuid": "e68eacb2-5b8b-46f0-9189-a63a0d739dd9",
    "style": {
      "width": "100px",
      "height": "100px"
    },
    "pageId": "4bb2c99e-1615-4bcb-a530-b8038b8edcc8",
    "childrenIds": [
      "41c1199e-a4eb-4f23-8707-3ed9f0a2492e",
      "770176d7-b582-4b20-bb61-7ca780510bdf",
      "3f07be1d-8be5-4a59-b46c-e805c926cab2"
    ],
    "application_id": "1",
    "component_type": "vertical-container-block"
  },
  {
    "name": "Collection_9727",
    "uuid": "41c1199e-a4eb-4f23-8707-3ed9f0a2492e",
    "event": {
      "onInit": "// Existing load_functions method\nVars.load_functions = () => {\n    fetch('/api/v1/functions', {\n        method: 'GET',\n        headers: {\n            'Content-Type': 'application/json',\n        },\n    })\n    .then(response => {\n        if (!response.ok) {\n            // Handle non-OK response\n            throw new Error(`HTTP error! status: ${response.status}`);\n        }  \n        return response.json();\n    })\n    .then(data => {\n        console.log(\"data\", data); \n        Vars.studio_functions = data || [];\n        return data;\n    })\n    .catch(error => {\n        console.error('Error fetching functions:', error);\n        throw error; // Re-throw the error so the caller can handle it\n    });\n};\nVars.load_functions();\n// New create_function method\nVars.create_function = (newFunctionData) => {\n    return fetch('/api/v1/functions', {\n        method: 'POST',\n        headers: {\n            'Content-Type': 'application/json',\n        },\n        body: JSON.stringify(newFunctionData),\n    })\n    .then(response => {\n        if (!response.ok) {\n            // Handle non-OK response\n            return response.json().then(errData => {\n                const errorMessage = errData.message || `HTTP error! status: ${response.status}`;\n                throw new Error(errorMessage);\n            });\n        }\n        return response.json();\n    })\n    .then(createdFunction => {\n        console.log(\"Function created successfully:\", createdFunction);\n        Vars.studio_functions.push(createdFunction);\n        return createdFunction;\n    })\n    .catch(error => {\n        console.error('Error creating function:', error);\n        throw error; // Re-throw the error so the caller can handle it\n    });\n};\n\n\n/*Vars.create_function(newFunction)\n    .then(createdFunction => {\n        console.log(\"Created Function:\", createdFunction);\n        // Perform additional actions if needed\n    })\n    .catch(error => {\n        console.error(\"Failed to create function:\", error);\n    });*/"
    },
    "input": {
      "data": {
        "type": "handler",
        "value": "return Vars.studio_functions;"
      }
    },
    "pageId": "4bb2c99e-1615-4bcb-a530-b8038b8edcc8",
    "childrenIds": [
      "46048d56-5520-4370-8b91-ff985c82b378"
    ],
    "application_id": "1",
    "component_type": "Collection"
  },
  {
    "name": "text_input_9052",
    "uuid": "7769dda5-2969-4d76-98aa-4a9362fb3344",
    "event": {
      "valueChange": "Vars.studio_function_create_name = EventData.value;\n"
    },
    "input": {
      "label": {
        "type": "value",
        "value": "Function Name"
      },
      "value": {
        "type": "handler",
        "value": ""
      },
      "helper": {
        "type": "value",
        "value": ""
      },
      "placeholder": {
        "type": "value",
        "value": "get-users"
      }
    },
    "pageId": "4bb2c99e-1615-4bcb-a530-b8038b8edcc8",
    "childrenIds": [],
    "application_id": "1",
    "component_type": "text_input"
  },
  {
    "name": "button_input_2401",
    "uuid": "b67f4f2e-1232-4c31-beb9-f73c7c04802e",
    "event": {
      "onClick": "const newFunction = {\n    \"label\": Vars.studio_function_create_name,\n    \"description\": Vars.studio_function_create_name,\n    \"template\": \"v1/deno/2\",\n    \"runtime\": \"deno\",\n    \"handler\": \"\"\n};\nconsole.log(newFunction);\nVars.create_function(newFunction).then(()=>{\n    Vars.load_functions();\n    Vars.studio_display_create_function_block = false;\n})"
    },
    "input": {
      "label": {
        "type": "value",
        "value": "Confirm"
      },
      "state": {
        "type": "handler",
        "value": "console.log(Vars.studio_function_create_name)\nreturn !!Vars.studio_function_create_name ? \"\" : \"disabled\""
      }
    },
    "style": {
      "width": "80px"
    },
    "pageId": "4bb2c99e-1615-4bcb-a530-b8038b8edcc8",
    "childrenIds": [],
    "application_id": "1",
    "component_type": "button_input"
  },
  {
    "name": "text_label_3494",
    "uuid": "46048d56-5520-4370-8b91-ff985c82b378",
    "event": {
      "onClick": "SetVar('currentFunction', Item);\n      openEditorTab({ id: Item.id, label: 'Function: ' + Item.label ,type:'function' , detail: { uuid: Item.id, handler : Item.handler} })\n      setCurrentEditorTab({ id: Item.id, label: 'Function: ' + Item.label ,type:'function' , detail: { uuid: Item.id, handler : Item.handler} })"
    },
    "input": {
      "value": {
        "type": "handler",
        "value": "return Item.label"
      }
    },
    "pageId": "4bb2c99e-1615-4bcb-a530-b8038b8edcc8",
    "childrenIds": [],
    "application_id": "1",
    "component_type": "text_label"
  },
  {
    "name": "vertical-container-block_5089",
    "uuid": "770176d7-b582-4b20-bb61-7ca780510bdf",
    "input": {
      "display": {
        "type": "handler",
        "value": "return !!Vars.studio_display_create_function_block;"
      }
    },
    "pageId": "4bb2c99e-1615-4bcb-a530-b8038b8edcc8",
    "childrenIds": [
      "7769dda5-2969-4d76-98aa-4a9362fb3344",
      "b67f4f2e-1232-4c31-beb9-f73c7c04802e",
      "f6d5d534-ba89-4f13-a0d8-f94c3b88bfa8"
    ],
    "application_id": "1",
    "component_type": "vertical-container-block"
  },
  {
    "name": "button_input_4743",
    "uuid": "3f07be1d-8be5-4a59-b46c-e805c926cab2",
    "event": {
      "onClick": "Vars.studio_display_create_function_block = true;"
    },
    "input": {
      "label": {
        "type": "value",
        "value": "Add function"
      },
      "display": {
        "type": "handler",
        "value": "return !Vars.studio_display_create_function_block"
      }
    },
    "pageId": "4bb2c99e-1615-4bcb-a530-b8038b8edcc8",
    "childrenIds": [],
    "application_id": "1",
    "component_type": "button_input"
  },
  {
    "name": "button_input_7279",
    "uuid": "f6d5d534-ba89-4f13-a0d8-f94c3b88bfa8",
    "event": {
      "onClick": "Vars.studio_display_create_function_block = false;"
    },
    "input": {
      "label": {
        "type": "value",
        "value": "Cancel"
      }
    },
    "style": {
      "type": "danger"
    },
    "pageId": "4bb2c99e-1615-4bcb-a530-b8038b8edcc8",
    "childrenIds": [],
    "application_id": "1",
    "component_type": "button_input"
  }
];