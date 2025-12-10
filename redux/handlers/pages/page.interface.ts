import { type ComponentElement } from '../../store/component/component.interface';

export type PageElement = {
  //id?: string;
  uuid?: string;
  application_id?: string;
  name: string;
  url: string;
  style?: any;
  components?: ComponentElement[];
  component_ids?: string[];
  description?: string;
  is_default?: boolean;
};
