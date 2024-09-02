export interface IMenu {
  text: string;
  link?: string;
  menu?:{icon:string,actions:IAction[]};
  icon?: string;
  iconPosition?: string;
  selected?: boolean;
  disabled?: boolean;
  children?: IMenu[];
}
export interface IAction{
  label:string,
  value:string
}
