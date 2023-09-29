import { $currentPage, $currentPageId, $pages } from "../page/store";
import { v4 as uuidv4 } from "uuid";
import { DraggingComponentInfo } from "./interface";

import {
  ComponentElement,
  ComponentType,
} from "./interface";
import {
  $components,
  $currentComponentId,
  $draggingComponentInfo,
  $hoveredComponentId,
} from "./sotre";
import { addComponentToCurrentPageAction, removeComponentToCurrentPageAction } from "$store/page/action";
import { action } from "nanostores";
import { PageElement } from "$store/page/interface";

export interface AddComponentRequest {
  id?: string;
  name: string;
  type: ComponentType;
  attributes?: any;
  parameters?: any;
  styleHandlers: { [key: string]: string };
  event: { [key: string]: string };
  style: { [key: string]: string };
  input: { [key: string]: string };
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
  const currentComponentId = $currentComponentId.get();
  if(currentComponentId){
    const currentComponent = $components.get().find((component: ComponentElement) => component.id === currentComponentId);
    if(currentComponent.type === ComponentType.VerticalContainer){
      addComponentAsChildOf(componentId, currentComponentId);
      
    }else{
      addComponentToCurrentPageAction(componentId);
    }
  }else{
    addComponentToCurrentPageAction(componentId);
  }
}

export function addComponentAsChildOf(componentId : string, parentComponent : string){
  $components.set([
    ...$components.get().map((component: ComponentElement) => {
      if (component.id ===  parentComponent) {
        if(!component.childrenIds){
          component.childrenIds = [];
        }
        component.childrenIds.push(componentId);
      }
      return component;
    }),
  ]);
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
  draggedComponentId: string
) {
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
        );
      }
      return page;
    })
  );
}
export function moveDraggedComponentInside(
  dropInComponentId: string,
  draggedComponentId: string,
 
) {

  let components: ComponentElement[] = $components.get();
  // Find the component to be moved (draggedComponent) and the target component (dropInComponent).
  let draggedComponent: ComponentElement | undefined;
  let parentDraggedComponent: ComponentElement | undefined;
  let dropInComponent: ComponentElement | undefined;

  // Find draggedComponent and dropInComponent in the root array and within children.
  function findComponentsRecursively(component: ComponentElement) {
    if (component.id === draggedComponentId) {
      draggedComponent = component;
    }
    if (component.id === dropInComponentId) {
      dropInComponent = component;
    }
    parentDraggedComponent = components.find((c) => c.childrenIds?.includes(draggedComponentId));
    if (!draggedComponent || !dropInComponent) {
      // If both components are not found yet, continue searching in children.
      if (component.childrenIds) {
        for (const childId of component.childrenIds) {
          const child = components.find((c) => c.id === childId);
          if (child) {
            findComponentsRecursively(child);
          }
        }
      }
    }

  }
  // Start the recursive search.
  for (const component of components) {
    findComponentsRecursively(component);
  }

  // If both components are found, update their relationship.
  if (draggedComponent && dropInComponent) {
    if (!dropInComponent.childrenIds) {
      dropInComponent.childrenIds = [];
    }
    dropInComponent.childrenIds.push(draggedComponentId);
   
    removeComponentToCurrentPageAction(draggedComponentId);
   
      if (parentDraggedComponent && parentDraggedComponent.childrenIds) {
        parentDraggedComponent.childrenIds = parentDraggedComponent.childrenIds.filter(
          (childId) => childId !== draggedComponentId
        );
      }
  }
  $components.set([...components])
}






export function moveDraggedComponentIntoCurrentPageRoot(
  draggedComponentId: string,
) {

  let components: ComponentElement[] = $components.get();
  // Find the component to be moved (draggedComponent) and the target component (dropInComponent).
  let draggedComponent: ComponentElement | undefined;
  let parentDraggedComponent: ComponentElement | undefined;

  // Find draggedComponent and dropInComponent in the root array and within children.
  function findComponentsRecursively(component: ComponentElement) {
    if (component.id === draggedComponentId) {
      draggedComponent = component;
    }
    parentDraggedComponent = components.find((c) => c.childrenIds?.includes(draggedComponentId));
    if (!draggedComponent ) {
      // If both components are not found yet, continue searching in children.
      if (component.childrenIds) {
        for (const childId of component.childrenIds) {
          const child = components.find((c) => c.id === childId);
          if (child) {
            findComponentsRecursively(child);
          }
        }
      }
    }

  }
  // Start the recursive search.
  for (const component of components) {
    findComponentsRecursively(component);
  }

  // If both components are found, update their relationship.
  if (draggedComponent ) {
   
   
    addComponentToCurrentPageAction(draggedComponentId);
   
      if (parentDraggedComponent && parentDraggedComponent.childrenIds) {
        parentDraggedComponent.childrenIds = parentDraggedComponent.childrenIds.filter(
          (childId) => childId !== draggedComponentId
        );
      }
  }
  $components.set([...components])
}





export function updateComponentParameters(
  componentId: string,
  updatedParameters: any
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

export function updateComponentInput(componentId: string, updatedInputs: any) {
  $components.set([
    ...$components.get().map((component: ComponentElement) => {
      if (component.id === componentId) {
        component.input = {
          ...component.input,
          ...updatedInputs,
        };
      }
      return component;
    }),
  ]);
}

export function updateComponentAttributes(
  componentId: string,
  updatedAttributes: any
) {
  $components.set([
    ...$components.get().map((component: ComponentElement) => {
      if (component.id === componentId) {
        component.style = {
          ...component.style,
          ...updatedAttributes,
        };
      }
      return { ...component };
    }),
  ]);
}

export function updateComponentstyleHandlers(
  componentId: string,
  updatedAttributes: any
) {
  $components.set([
    ...$components.get().map((component: ComponentElement) => {
      if (component.id === componentId) {
        component.styleHandlers = {
          ...component.styleHandlers,
          ...updatedAttributes,
        };
      }
      return { ...component };
    }),
  ]);
}

export function updateComponentAttributeHandlers(
  componentId: string,
  scope: string,
  updatedAttributes: any
) {
  $components.set([
    ...$components.get().map((component: ComponentElement) => {
      if (component.id === componentId) {
        component[scope] = {
          ...component[scope],
          ...updatedAttributes,
        };
      }
      return { ...component };
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

export function updateComponent(componentId: string, componentAttributes: any) {
  $components.set([
    ...$components.get().map((component: ComponentElement) => {
      if (component.id === componentId) {
        Object.assign(component, componentAttributes);
      }
      return { ...component };
    }),
  ]);
}

export function updateComponentError(
  componentId: string,
  error: { [key: string]: string }
) {
  $components.set([
    ...$components.get().map((component: ComponentElement) => {
      if (component.id === componentId) {
        component.errors = {
          ...component.errors,
          ...error,
        };
      }
      return { ...component };
    }),
  ]);
}

export function setCurrentComponentIdAction(componentId: string) {
  $currentComponentId.set(componentId);
}

export function setHoveredComponentIdAction(componentId: string) {
  $hoveredComponentId.set(componentId);
}
