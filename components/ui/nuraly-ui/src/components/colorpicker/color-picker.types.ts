/**
 * ColorPicker size variants
 */
export const enum ColorPickerSize {
  Default = 'default',
  Small = 'small',
  Large = 'large',
}

/**
 * ColorPicker trigger modes
 */
export const enum ColorPickerTrigger {
  Click = 'click',
  Hover = 'hover',
  Manual = 'manual',
}

/**
 * ColorPicker placement options
 */
export const enum ColorPickerPlacement {
  Top = 'top',
  Bottom = 'bottom',
  Auto = 'auto',
}

/**
 * ColorPicker animation types
 */
export const enum ColorPickerAnimation {
  None = 'none',
  Fade = 'fade',
  Slide = 'slide',
  Scale = 'scale',
}

/**
 * ColorPicker format options
 */
export const enum ColorFormat {
  Hex = 'hex',
  RGB = 'rgb',
  RGBA = 'rgba',
  HSL = 'hsl',
  HSLA = 'hsla',
}

/**
 * ColorPicker configuration
 */
export interface ColorPickerConfig {
  trigger?: ColorPickerTrigger;
  placement?: ColorPickerPlacement;
  animation?: ColorPickerAnimation;
  disabled?: boolean;
  closeOnSelect?: boolean;
  closeOnOutsideClick?: boolean;
  closeOnEscape?: boolean;
  showInput?: boolean;
  showCopyButton?: boolean;
  format?: ColorFormat;
  defaultColorSets?: string[];
}
