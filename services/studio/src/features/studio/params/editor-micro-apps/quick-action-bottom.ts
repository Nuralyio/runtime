import { COMMON_ATTRIBUTES } from "@studio/core/helpers/common_attributes.ts";
import { ComponentType } from "@shared/redux/store/component/interface.ts";

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
    input : {
      show:{
        type : "boolean",
        value : true
      },
      options:{
        type: "handler",
        value: /* javascript */`
          const selectedComponent = Utils.first(Vars.selectedComponents);
          let options = [];
          if(selectedComponent){
            options = [
              { label: 'Copy', value: 'Copy', icon: 'copy' },
              { label: 'Paste', value: 'Paste', icon: 'paste' },
              { label: 'Delete', value: 'Delete', icon: 'trash' },
              { label: 'Export', value: 'value12' },
              { label: 'Import', value: 'value12' },
            ];
          }
          return options;
        `
      }
    },
    event : {
      onItemClicked: /* javascript */`
      const selectedComponent = Utils.first(Vars.selectedComponents);
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