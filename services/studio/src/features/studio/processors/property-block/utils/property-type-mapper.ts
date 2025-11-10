/**
 * Property Type Mapper
 * Maps property types to ComponentType enum values
 */

import { ComponentType } from "@shared/redux/store/component/component.interface.ts";

export class PropertyTypeMapper {
  static getComponentType(type: string): ComponentType {
    switch (type) {
      case 'number':
        return ComponentType.TextInput;  // Number inputs use TextInput component
      case 'select':
        return ComponentType.Select;
      case 'color':
        return ComponentType.ColorPicker;
      case 'boolean':
        return ComponentType.Checkbox;
      case 'radio':
        return ComponentType.RadioButton;
      case 'event':
        return ComponentType.Event;  // Low-code editor for dynamic data
      case 'icon':
        return ComponentType.IconPicker;  // Icon picker component
      default:
        return ComponentType.TextInput;
    }
  }
}
