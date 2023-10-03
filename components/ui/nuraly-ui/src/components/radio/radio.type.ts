import {TemplateResult} from 'lit';

export type RadionButtonOption = {
  icon?: string;
  type?: string;
};

export type RadioOption = {
  value: string;
  label: string | TemplateResult<1>;
  tempale?: TemplateResult<1>;
  handler?: Function;
  id?: string | number;
  button?: RadionButtonOption;
};

export enum RadioButtonType {
  Default = 'default',
  Button = 'button',
}
