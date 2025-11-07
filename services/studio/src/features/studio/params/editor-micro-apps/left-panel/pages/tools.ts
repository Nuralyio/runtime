import { ComponentType } from "@shared/redux/store/component/component.interface";

export const menuTools = {
  uuid: "menu_tools",
  name: "menu tools",
  application_id: "1",
  component_type: ComponentType.Container,
  style: {
    "gap": "5px",
    "align-items": "center",
    "justify-content": "space-between"
  },
  childrenIds: ["add_page"]
};
