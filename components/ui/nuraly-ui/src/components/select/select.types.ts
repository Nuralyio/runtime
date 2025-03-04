export interface IOption {
  label: string;
  value: string;
  additionalStyle?: any;
}

export enum OptionType {
  Default = 'default',
  Inline = 'inline',
}
export enum OptionStatus {
  Warning = 'warning',
  Error = 'error',
  Default = 'Default',
}

export enum OptionSelectionMode {
  Single = 'single',
  Multiple = 'multiple',
}
export enum OptionSize {
  Small = 'small',
  Medium = 'medium',
  Large = 'large',
}
