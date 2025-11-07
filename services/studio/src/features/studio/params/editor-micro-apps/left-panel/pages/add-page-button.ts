import { ComponentType } from "@shared/redux/store/component/component.interface";

export const addPageButton = {
  uuid: "add_page",
  name: "add page",
  component_type: ComponentType.Button,
  application_id: "1",
  style: {},
  input: {
    label: {
      type: "string",
      value: "Page"
    },
    iconPosition: {
      type: "string",
      value: "left"
    },
    size: {
      type: "string",
      value: "small"
    },
    icon: {
      type: "string",
      value: "plus"
    }
  },
  event: {
    onClick: /* js */`
      try {
        const currentEditingApplication = GetVar("currentEditingApplication");
        const appPages = GetContextVar(currentEditingApplication?.uuid + ".appPages", currentEditingApplication?.uuid);
        const newPage = {
          name: "Page_" + (appPages.length + 1),
          url: ("Page_" + (appPages.length + 1)).toLowerCase(),
          description: "",
          component_ids: []
        };
        AddPage(newPage, currentEditingApplication.uuid).then(() => {
        }).catch((e) => {
          console.error(e);
        })
      } catch(e) {
        console.log(e);
      }
    `
  }
};
