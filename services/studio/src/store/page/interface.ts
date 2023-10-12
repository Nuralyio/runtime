import { ComponentElement } from "$store/component/interface";

export type PageElement = {
  id: string;
  name: string;
  style: any;
  components?: ComponentElement[];
  componentIds?: string[];
};
