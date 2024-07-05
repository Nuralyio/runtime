export interface IOption {
  label: string;
  value?: string;
  disabled?: boolean;
  icon?: string;
  children?: IOption[];
}

export const enum TriggerMode {
  Click = 'click',
  Hover = 'hover',
}
export const enum DropDownDirection {
  Right = 'right',
  Left = 'left',
}
