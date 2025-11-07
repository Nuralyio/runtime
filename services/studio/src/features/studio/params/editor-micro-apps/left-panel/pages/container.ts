import { ComponentType } from "@shared/redux/store/component/component.interface";

export const pagesPanelContainer = {
  uuid: "pages_panel",
  application_id: "1",
  name: "Pages panel",
  component_type: ComponentType.Container,
  input: {
    direction: {
      type: "string",
      value: "vertical"
    }
  },
  style: {
    width: "292px",
    height: "100%",
    "--nuraly-button-font-size": "12px"
  },
  childrenIds: ["menu_heade2r", "menu_1", "component_panel"]
};
