import { COMMON_ATTRIBUTES } from "../../core/helpers/common_attributes.ts";

export default [
  {
    uuid: "page_default_checkbox_block",
    application_id: "1",
    name: "page default checkbox block",
    component_type: "vertical-container-block",
    ...COMMON_ATTRIBUTES,
    style: {
      display: "flex",
      "align-items": "center",
      "justify-content": "space-between",
      width: "250px",
      gap: "8px"
    },
    childrenIds: ["page_default_checkbox_label", "page_default_checkbox_input"]
  },
  {
    uuid: "page_default_checkbox_label",
    name: "page default checkbox label",
    component_type: "text_label",
    application_id: "1",
    ...COMMON_ATTRIBUTES,
    input: {
      value: {
        type: "string",
        value: 'Default page'
      }
    },
    style: {
      width: "90px",
      "font-size": "12px"
    }
  },
  {
    uuid: "page_default_checkbox_input",
    name: "page default checkbox input",
    application_id: "1",
    component_type: "checkbox",
    ...COMMON_ATTRIBUTES,
    style: {
      size: "small"
    },
    event: {
      changed: /* js */ `
        const currentPageId = Vars.currentPage;
        if (currentPageId) {
          const isDefault = EventData.checked;
          const currentEditingApplication = GetVar("currentEditingApplication");
          const appPages = GetContextVar(currentEditingApplication?.uuid + ".appPages", currentEditingApplication?.uuid);
          const currentPage = appPages?.find((page) => page.uuid == currentPageId);
          
          const newPage = {
            ...currentPage,
            is_default: isDefault
          };
          
          UpdatePage(newPage, currentEditingApplication.uuid).then(() => {
            console.log('Page default status updated');
          }).catch((e) => {
            console.error('Error updating page default status:', e);
          });
        }
      `
    },
    input: {
      checked: {
        type: "handler",
        value: /* js */`
          const currentPageId = Vars.currentPage;
          if (currentPageId) {
            const currentEditingApplication = GetVar("currentEditingApplication");
            const appPages = GetContextVar(currentEditingApplication?.uuid + ".appPages", currentEditingApplication?.uuid);
            const currentPage = appPages?.find((page) => page.uuid == currentPageId);
            return currentPage?.is_default || false;
          }
          return false;
        `
      },
      label: {
        type: "string",
        // value: "Mark as home/landing page"
      }
    }
  }
];
