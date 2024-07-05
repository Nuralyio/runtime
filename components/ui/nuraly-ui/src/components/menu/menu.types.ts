export interface IMenu {
  text: string;
  link?: string;
  icon?: string;
  iconPosition?: string;
  selected?: boolean;
  disabled?: boolean;
  children?: IMenu[];
}
