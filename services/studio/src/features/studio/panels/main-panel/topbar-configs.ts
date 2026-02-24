import { COMPONENT_PROPERTIES, type PropertyConfig } from '../control-panel/native/property-configs';

export interface TopbarOverride {
  width?: string;
  optionLabels?: Record<string, string>;  // value → short label
}

export interface TopbarControl {
  property: PropertyConfig;
  width?: string;
  optionLabels?: Record<string, string>;
}

/**
 * Defines which properties from COMPONENT_PROPERTIES appear in the topbar.
 * Keys = component type, values = list of { inputProperty, ...overrides }.
 * Options, type, placeholder are all inherited from property-configs.
 */
const TOPBAR_FIELDS: Record<string, Array<{ inputProperty: string } & TopbarOverride>> = {
  button_input: [
    { inputProperty: 'label', width: '120px' },
    { inputProperty: 'variant' },
    { inputProperty: 'size', optionLabels: { small: 'S', medium: 'M', large: 'L' } },
  ],
  text_label: [
    { inputProperty: 'value', width: '120px' },
    { inputProperty: 'size', optionLabels: { small: 'S', medium: 'M', large: 'L' } },
    { inputProperty: 'variant' },
  ],
  text_input: [
    { inputProperty: 'placeholder', width: '120px' },
    { inputProperty: 'size', optionLabels: { small: 'S', medium: 'M', large: 'L' } },
    { inputProperty: 'type' },
  ],
  container: [
    { inputProperty: 'direction' },
    { inputProperty: 'gap', width: '60px' },
    { inputProperty: 'padding', width: '60px' },
  ],
  image: [
    { inputProperty: 'src', width: '150px' },
    { inputProperty: 'objectFit' },
  ],
  checkbox: [
    { inputProperty: 'label', width: '120px' },
    { inputProperty: 'checked' },
  ],
  select: [
    { inputProperty: 'placeholder', width: '120px' },
    { inputProperty: 'size', optionLabels: { small: 'S', medium: 'M', large: 'L' } },
    { inputProperty: 'searchable' },
  ],
  icon: [
    { inputProperty: 'name', width: '100px' },
    { inputProperty: 'color' },
    { inputProperty: 'size', width: '60px' },
  ],
  textarea: [
    { inputProperty: 'placeholder', width: '120px' },
    { inputProperty: 'rows', width: '50px' },
  ],
  date_picker: [
    { inputProperty: 'placeholder', width: '120px' },
    { inputProperty: 'format', width: '100px' },
  ],
  slider: [
    { inputProperty: 'min', width: '50px' },
    { inputProperty: 'max', width: '50px' },
    { inputProperty: 'step', width: '50px' },
  ],
  badge: [
    { inputProperty: 'value', width: '100px' },
    { inputProperty: 'variant' },
  ],
  tag: [
    { inputProperty: 'value', width: '100px' },
    { inputProperty: 'closable' },
  ],
};

export function getTopbarControls(componentType: string): TopbarControl[] | null {
  const fields = TOPBAR_FIELDS[componentType];
  if (!fields) return null;

  const properties = COMPONENT_PROPERTIES[componentType];
  if (!properties) return null;

  return fields.reduce<TopbarControl[]>((controls, field) => {
    const prop = properties.find(p => p.inputProperty === field.inputProperty);
    if (prop) {
      controls.push({ property: prop, width: field.width, optionLabels: field.optionLabels });
    }
    return controls;
  }, []);
}
