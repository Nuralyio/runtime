import { ComponentElement } from "$store/component/interface";

export type PageElement = {
  id: string;
  name: string;
  components?: ComponentElement[];
  componentIds?: string[];
};
