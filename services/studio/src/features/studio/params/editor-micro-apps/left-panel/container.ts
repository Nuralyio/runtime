import { ComponentType } from "@shared/redux/store/component/component.interface";

export const leftPanelContainer = {
  uuid: "331",
  application_id: "1",
  name: "Left panel",
  component_type: ComponentType.Container,
  input: {
    direction: {
      type: "string",
      value: "vertical"
    }
  },
  style: {
    width: "100%",
    height: "100%",
    display: "grid",
  },
  childrenIds: ["left_panel_tabs"]
};
