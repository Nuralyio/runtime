import { $currentPage } from "../page/store";
import { v4 as uuidv4 } from "uuid";

import {
  ComponentElement,
  ComponentType,
  TextInputAttributes,
  TextInputParameters,
  TextLabelAttributes,
  TextLabelParameters,
} from "./interface";
import { $components, $currentComponentId } from "./sotre";
import { addComponentToCurrentPageAction } from "$store/page/action";
import { action } from "nanostores";

export interface AddComponentRequest {
  id?: string;
  name: string;
  type: ComponentType;
  attributes?: TextLabelAttributes | TextInputAttributes;
  parameters?: TextLabelParameters | TextInputParameters;
  childrens?: ComponentElement[];
  pageId?: string;
}

/** Actions*/
export function addComponentAction(component: AddComponentRequest) {
  const { id } = $currentPage.get();
  const componentId = uuidv4();
  $components.set([
    ...$components.get(),
    {
      ...component,
      id: componentId,
      pageId: id,
    } as ComponentElement,
  ]);
  addComponentToCurrentPageAction(componentId);
}

export function updateComponentParameters(
  componentId: string,
  updatedParameters: TextLabelParameters | TextInputParameters
) {
  $components.set([
    ...$components.get().map((component: ComponentElement) => {
      if (component.id === componentId) {
        component.parameters = {
          ...component.parameters,
          ...updatedParameters,
        };
      }
      return component;
    }),
  ]);
}

export function updateComponentAttributes(
  componentId: string,
  updatedAttributes: TextLabelAttributes | TextInputAttributes
) {
  $components.set([
    ...$components.get().map((component: ComponentElement) => {
      if (component.id === componentId) {
        component.attributes = {
          ...component.attributes,
          ...updatedAttributes,
        };
      }
      return component;
    }),
  ]);
}

/*
export const setCurrentComponentIdAction = action(
  $currentComponentId,
  "setCurrentComponentId",
  (store, componentId) => {
    store.set(componentId);
    return store.get();
  }
);*/

export function setCurrentComponentIdAction(componentId: string) {
  $currentComponentId.set(componentId);
}
