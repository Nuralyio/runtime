import { ComponentType } from "@shared/redux/store/component/component.interface";

export default [

  {
    uuid: "micro-app-landing",
    name: "MicroApp",
    component_type: ComponentType.MicroApp,

    input: {
      appUUID: {
        type: "string",
        value: "8639f6d5-9171-41e4-a21c-447c8c1b62c2"
      },
      mode: {
        type: "string",
        value: "preview"
      }
    },
    application_id: "landing"

  }
];