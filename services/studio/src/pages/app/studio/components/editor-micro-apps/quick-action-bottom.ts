import { COMMON_ATTRIBUTES } from "../../studio-microapp/helper/common_attributes.ts";
import { ComponentType } from "$store/component/interface.ts";

export default [
  {
    uuid: "quick-action-wrapper-bottom",
    application_id: "1",
    name: "helper text block",
    component_type: ComponentType.Container,
    input: {
      direction: {
        type: "string",
        value: "horizontal"
      }
    },
    ...COMMON_ATTRIBUTES,
    childrenIds: [ "dropdonwn-context"]
  },
 
  // {
  //   uuid: "export-import-block-wrapper",
  //   application_id: "1",
  //   name: "export-import-block-wrapper",
  //   component_type: ComponentType.ExportImport
  // },
  {
    uuid: "dropdonwn-context",
    application_id: "1",
    name: "dropdonwn-context",
    component_type: ComponentType.Dropdown,
    event : {
      onItemClicked: /* javascript */`
      const selectedComponent = Utils.first(Vars.selectedComponents);
      console.clear();
      console.log(EventData.value);
      switch(EventData.value) {
        case 'Copy':
          CopyComponentToClipboard(selectedComponent);
          break;
        case 'Paste':
          PasteComponentFromClipboard();
          break;
          case 'Delete':
            DeleteComponentAction(selectedComponent);
            break;
      }
     
      `
  }

  }
];