import { ComponentType } from "@shared/redux/store/component/component.interface";

export const menuHeader = {
  uuid: "menu_header",
  name: "menu header",
  application_id: "1",
  component_type: ComponentType.Container,
  style: {
    "gap": "5px",
    "align-items": "center",
    "justify-content": "space-between",
    "width": "100%"
  },
  childrenIds: ["menu_title", "menu_tools"]
};
