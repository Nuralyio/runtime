import { COMMON_ATTRIBUTES } from '../../core/helpers/common_attributes.ts';
export default [
  {
    uuid: "quick-action-wrapper-bottom",
    application_id: "1",
    name: "helper text block",
    component_type: "vertical-container-block",
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
  //   component_type: "ExportImport"
  // },
  {
    uuid: "dropdonwn-context",
    application_id: "1",
    name: "dropdonwn-context",
    component_type: "dropdown",
    input : {
      show:{
        type : "boolean",
        value : true
      },
      options:{
        type: "handler",
        value: /* javascript */`
          const selectedComponent = Utils.first($selectedComponents);
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
      const selectedComponent = Utils.first($selectedComponents);
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