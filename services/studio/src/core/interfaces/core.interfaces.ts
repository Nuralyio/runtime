import type { ComponentElement } from "$store/component/interface";

export interface Extrats {
  event?: Event|CustomEvent|MouseEvent|KeyboardEvent|InputEvent;
  [key: string]: any;
}

export interface ServiceWorkerMessage {
  funtionNameToExecute: string;
  component: ComponentElement;
  syncResponse?: string;
  eventData?: any;
  args: object;
}

export interface Application {
  default_page_uuid?: string;
  name: string;
  uuid: string;
}