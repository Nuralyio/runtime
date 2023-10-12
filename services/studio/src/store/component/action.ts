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
import { GenerateName } from "utils/naming-generator";

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
  const components: ComponentElement[] = $components.get();

  // Find the dragged component and its parent (if it's a child component)
  let draggedComponent: ComponentElement | undefined;
  let parentDraggedComponent: ComponentElement | undefined;
  parentDraggedComponent = components.find((c) => c.childrenIds?.includes(draggedComponentId));

  // Find the draggedComponent and parentDraggedComponent in the root array and within children.
  function findComponentsRecursively(component: ComponentElement) {
    if (component.id === draggedComponentId) {
      draggedComponent = component;
    }
    if (!draggedComponent || !parentDraggedComponent) {
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

  // If both components are found and they are not the same, and draggedComponent is not already in dropInComponent, update their relationship.
  if (draggedComponent && draggedComponent.id !== dropInComponentId) {
    // Check if draggedComponent is already in the components list.
    const isDraggedComponentInList = components.some(
      (component) => component.id === draggedComponentId
    );

    if (!isDraggedComponentInList) {
      // If it's not in the list, add it.
      components.push(draggedComponent);
    }

    // Find the index of the dropInComponent in the main page.
    const pageIndex = $pages.get().findIndex(
      (page: PageElement) => page.id === $currentPageId.get()
    );
    if (pageIndex >= 0) {
      const page = $pages.get()[pageIndex];
      const dropInComponentIndex = page.componentIds.findIndex(
        (componentId: string) => componentId === dropInComponentId
      );

      // Remove draggedComponent from its previous parent (if any).
      if (parentDraggedComponent && parentDraggedComponent.childrenIds) {
        parentDraggedComponent.childrenIds = parentDraggedComponent.childrenIds.filter(
          (childId) => childId !== draggedComponentId
        );
      }

      // If dropInComponent is in the main page, update its position.
      if (dropInComponentIndex >= 0) {
        // Insert draggedComponent at the same level as dropInComponent.
        page.componentIds.splice(
          dropInComponentIndex,
          0,
          draggedComponentId
        );
      } else {
        // If dropInComponent is not in the main page, it means it's a child component.
        // Add draggedComponent at the same level as dropInComponent.
        const parentDropInComponentId = parentDraggedComponent?.id;

        if (parentDropInComponentId) {
          const parentDropInComponent = components.find(
            (component) => component.id === parentDropInComponentId
          );

          if (parentDropInComponent && parentDropInComponent.childrenIds) {
            const dropInComponentPosition = parentDropInComponent.childrenIds.findIndex(
              (childId) => childId === dropInComponentId
            );

            if (dropInComponentPosition >= 0) {
              parentDropInComponent.childrenIds.splice(
                dropInComponentPosition,
                0,
                draggedComponentId
              );
            }
          }
        }
      }

      // Set the updated components list and pages.
      $components.set([...components]);
      $pages.set([...$pages.get()]);
    }
  }
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

  // If both components are found and they are not the same, and draggedComponent is not already in dropInComponent, update their relationship.
  if (draggedComponent && dropInComponent && draggedComponent !== dropInComponent) {
    if (!dropInComponent.childrenIds) {
      dropInComponent.childrenIds = [];
    }
    
    // Check if draggedComponent is not already in dropInComponent.
    if (!dropInComponent.childrenIds.includes(draggedComponentId)) {
      dropInComponent.childrenIds.push(draggedComponentId);

      removeComponentToCurrentPageAction(draggedComponentId);

      if (parentDraggedComponent && parentDraggedComponent.childrenIds) {
        parentDraggedComponent.childrenIds = parentDraggedComponent.childrenIds.filter(
          (childId) => childId !== draggedComponentId
        );
      }

      $components.set([...components]);
    }
  }
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


export function deleteComponentAction(componentId: string) {
  const components = $components.get();

  function removeFromChildrenIdsRecursive(component: ComponentElement) {
    if (component.childrenIds && component.childrenIds.includes(componentId)) {
      component.childrenIds = component.childrenIds.filter(childId => childId !== componentId);
    }
    for (const childId of component.childrenIds || []) {
      const child = components.find((c) => c.id === childId);
      if (child) {
        removeFromChildrenIdsRecursive(child);
      }
    }
  }

  // Find the index of the component to delete
  const indexToDelete = components.findIndex((component: ComponentElement) => component.id === componentId);

  if (indexToDelete !== -1) {
    // Remove the component from the components array
    components.splice(indexToDelete, 1);

    // Update the store with the modified components array
    $components.set([...components]);

    // Call the recursive function to remove from parent's childrenIds
    components.forEach((component: ComponentElement) => {
      removeFromChildrenIdsRecursive(component);
    });

    // Remove the component from the current page if it was on the page
    removeComponentToCurrentPageAction(componentId);
  }
  
}

let clipboardComponent: ComponentElement | null = null;

export function copyComponentAction(componentId: string) {
  const components = $components.get();
  const componentToCopy = components.find((component: ComponentElement) => component.id === componentId);

  if (componentToCopy) {
    clipboardComponent = { ...componentToCopy, id: uuidv4() }; // Generate a new ID for the copied component
  }
}


export function pasteComponentAction() {
  if (clipboardComponent) {
    const { id } = $currentPage.get();
    clipboardComponent.id = uuidv4();
    const componentId = clipboardComponent.id;
    $components.set([
      ...$components.get(),
      {
        ...clipboardComponent,
        name: GenerateName(clipboardComponent.type),
        pageId: id,
      } as ComponentElement,
    ]);

    const currentComponentId = $currentComponentId.get();

    if (currentComponentId) {
      const currentComponent = $components.get().find(
        (component: ComponentElement) => component.id === currentComponentId
      );

      if (currentComponent?.type === ComponentType.VerticalContainer) {
        addComponentAsChildOf(componentId, currentComponentId);
      } else {
        addComponentToCurrentPageAction(componentId);
      }
    } else {
      addComponentToCurrentPageAction(componentId);
    }
  }
}
