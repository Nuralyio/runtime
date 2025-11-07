import { ComponentType } from "@shared/redux/store/component/component.interface";

export const menuTitle = {
  uuid: "menu_title",
  name: "menu title",
  application_id: "1",
  component_type: ComponentType.TextLabel,
  input: {
    value: {
      type: "string",
      value: 'Pages'
    }
  }
};
