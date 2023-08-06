import { $currentPage, $currentPageId, $pages } from "../page/store";
import { v4 as uuidv4 } from "uuid";
import { DraggingComponentInfo } from "./interface";

import {
  ComponentElement,
  ComponentType,
  TextInputAttributes,
  TextInputParameters,
  TextLabelAttributes,
  TextLabelParameters,
} from "./interface";
import {
  $components,
  $currentComponentId,
  $draggingComponentInfo,
} from "./sotre";
import { addComponentToCurrentPageAction } from "$store/page/action";
import { action } from "nanostores";
import { PageElement } from "$store/page/interface";

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

export function setDraggingComponentInfo(
  draggingComponentInfo: DraggingComponentInfo | null
) {
  if (draggingComponentInfo) {
    $draggingComponentInfo.set({
      ...draggingComponentInfo,
    });
  } else {
    $draggingComponentInfo.set(null);
  }
}

export function moveDraggedComponent(
  dropInComponentId: string,
  draggedComponentId
) {
  $currentPageId.get();
  $pages.set(
    $pages.get().map((page: PageElement) => {
      if (page.id === $currentPageId.get()) {
        const droppedInComponentIndex = page.componentIds.findIndex(
          (componentId: string) => componentId === dropInComponentId
        );

        page.componentIds = [
          ...page.componentIds.filter(
            (componentId: string) => componentId !== draggedComponentId
          ),
        ];
        page.componentIds.splice(
          droppedInComponentIndex,
          0,
          draggedComponentId
        ),
          console.log(page.componentIds);
      }
      return page;
    })
  );
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
