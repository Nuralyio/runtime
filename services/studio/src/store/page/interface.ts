import { type ComponentElement } from "$store/component/interface";

export type PageElement = {
  //id?: string;
  uuid: string;
  name: string;
  url: string;
  style?: any;
  components?: ComponentElement[];
  component_ids?: string[];
};
