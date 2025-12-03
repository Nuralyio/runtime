/**
 * Property Type Mapper
 * Maps property types to component type string values
 */

export class PropertyTypeMapper {
  static getComponentType(type: string): string {
    switch (type) {
      case 'number':
        return "text_input";  // Number inputs use TextInput component
      case 'select':
        return "select";
      case 'color':
        return "color_picker";
      case 'boolean':
        return "checkbox";
      case 'radio':
        return "RadioButton";
      case 'event':
        return "event";  // Low-code editor for dynamic data
      case 'icon':
        return "IconPicker";  // Icon picker component
      default:
        return "text_input";
    }
  }
}
