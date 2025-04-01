export interface IOption {
  label: string;
  value?: string;
  disabled?: boolean;
  icon?: string;
  children?: IOption[];
  additionalData?: any;
}

export const enum TriggerMode {
  Click = 'click',
  Hover = 'hover',
}
export const enum DropDownDirection {
  Right = 'right',
  Left = 'left',
}
