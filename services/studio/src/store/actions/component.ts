import { $currentPage, $currentPageId, $currentPageViewPort, $pages } from "../page";
import { v4 as uuidv4 } from "uuid";
import { type DraggingComponentInfo } from "../component/interface";

import {
  type ComponentElement,
  ComponentType,
} from "../component/interface";
import {
  $components,
  $currentComponentId,
  $draggingComponentInfo,
  $hoveredComponentId,
  type ComponentStore,
} from "../component/component-sotre";
import { addComponentToCurrentPageAction, removeComponentToCurrentPageAction } from "$store/actions/page";
import { type PageElement } from "$store/handlers/pages/interfaces/interface";
import { addComponentHandler } from "../handlers/components/add-component.handler";
import { updateComponentHandler } from "../handlers/components/update-component.handler";
import { eventDispatcher } from "utils/change-detection";
import type { AddComponentAction } from "$store/interfaces/component.interfaces";
import { getVar } from "$store/context";
import { deleteComponentActionHandler } from "$store/handlers/components/delete-component.handler";
const isServer = typeof window === 'undefined';


/** Actions*/
export const addComponentAction = (component: AddComponentAction, uuid: string/* page uuid */, currentApplicatinId) => {
  const currentComponentId = getVar("global", "selectedComponents")?.value[0]

  const componentId = uuidv4();
  const newComponent = {
    ...component,
    uuid: componentId,
    pageId: uuid,
    applicationId: currentApplicatinId
  } as ComponentElement
  if (!currentComponentId) {
    newComponent.root = true;
  }

  // Add component to the application's components
  $components.set({
    ...$components.get(),
    [currentApplicatinId]: [
      ...($components.get()[currentApplicatinId] || []), newComponent
      ,
    ],
  });
  console.log(newComponent)

  addComponentHandler({ component: newComponent }, currentApplicatinId);


  if (currentComponentId) {
    const currentComponent = $components.get()[currentApplicatinId].find((component: ComponentElement) => component.uuid === currentComponentId);
    // or ComponentType.Collection
    if (currentComponent?.component_type === ComponentType.VerticalContainer || currentComponent?.component_type === ComponentType.Collection) {
      addComponentAsChildOf(componentId, currentComponentId, currentApplicatinId);
    } else {
      addComponentToCurrentPageAction(componentId);
    }
  } else {
    addComponentToCurrentPageAction(componentId);
  }
};

export function addComponentAsChildOf(componentId: string, parentComponentId: string, applicationId: string) {
  const componentsStore: ComponentStore = $components.get();
  const components: ComponentElement[] = componentsStore[applicationId] || [];

  // Find the parent component
  const parentComponent = components.find((component) => component.uuid === parentComponentId);

  if (parentComponent) {
    // Ensure the parent component has a childrenIds array
    if (!parentComponent.childrenIds) {
      parentComponent.childrenIds = [];
    }

    // Add the new component ID to the parent's childrenIds array
    parentComponent.childrenIds.push(componentId);
    setTimeout(() => {
      updateComponentHandler(parentComponent, applicationId);
    }, 0);
    // Update the components store
    componentsStore[applicationId] = [...components];
    $components.set(componentsStore);
  } else {
    console.error(`Parent component with ID ${parentComponentId} not found.`);
  }
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
    if (component.uuid === draggedComponentId) {
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
  if (draggedComponent && draggedComponent.uuid !== dropInComponentId) {
    // Check if draggedComponent is already in the components list.
    const isDraggedComponentInList = components.some(
      (component) => component.uuid === draggedComponentId
    );

    if (!isDraggedComponentInList) {
      // If it's not in the list, add it.
      components.push(draggedComponent);
    }

    // Find the index of the dropInComponent in the main page.
    const pageIndex = $pages.get().findIndex(
      (page: PageElement) => page.uuid === $currentPageId.get()
    );
    if (pageIndex >= 0) {
      const page = $pages.get()[pageIndex];
      const dropInComponentIndex = page.component_ids.findIndex(
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
        page.component_ids.splice(
          dropInComponentIndex,
          0,
          draggedComponentId
        );
      } else {
        // If dropInComponent is not in the main page, it means it's a child component.
        // Add draggedComponent at the same level as dropInComponent.
        const parentDropInComponentId = parentDraggedComponent?.uuid;

        if (parentDropInComponentId) {
          const parentDropInComponent = components.find(
            (component) => component.uuid === parentDropInComponentId
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
    if (component.uuid === draggedComponentId) {
      draggedComponent = component;
    }
    if (component.uuid === dropInComponentId) {
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
    if (component.uuid === draggedComponentId) {
      draggedComponent = component;
    }
    parentDraggedComponent = components.find((c) => c.childrenIds?.includes(draggedComponentId));
    if (!draggedComponent) {
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
  if (draggedComponent) {


    addComponentToCurrentPageAction(draggedComponentId);

    if (parentDraggedComponent && parentDraggedComponent.childrenIds) {
      parentDraggedComponent.childrenIds = parentDraggedComponent.childrenIds.filter(
        (childId) => childId !== draggedComponentId
      );
    }
  }
  $components.set([...components])
}





export function updateComponentInput(componentId: string, updatedInputs: any) {
  $components.set([
    ...$components.get().map((component: ComponentElement) => {
      if (component.uuid === componentId) {
        component.input = {
          ...component.input,
          ...updatedInputs,
        };
      }
      return component;
    }),
  ]);
}



type UpdateType = 'style' | 'event' | 'input' | 'values'; // Define the types of updates allowed

export function updateComponentAttributes(
  applicationId: string,
  componentId: string,
  updateType: UpdateType,
  updatedAttributes: any,
  save = true
) {
  console.time('updateComponentAttributesExecutionTime'); // Start the timer

  const componentsStore = $components.get();
  const applicationComponents = componentsStore[applicationId] || [];
  const componentIndex = applicationComponents.findIndex(
    (component: ComponentElement) => component.uuid === componentId
  );

  if (componentIndex !== -1) {
    const componentToUpdate = applicationComponents[componentIndex];

    // Get the current attributes of the specified type
    const currentAttributes = componentToUpdate[updateType] || {};

    // Flag to track if any attributes need to be updated
    let needsUpdate = false;

    // Check each attribute in the updatedAttributes object
    for (const key in updatedAttributes) {
      if (currentAttributes[key] !== updatedAttributes[key]) {
        needsUpdate = true;
        break;
      }
    }

    if (needsUpdate) {
      // Update the specified attribute of the component
      componentToUpdate[updateType] = {
        ...currentAttributes,
        ...updatedAttributes,
      };

      // Directly update the component in the store
      console.time('setTime'); // Start the timer
      //console.log(`${applicationId}[${componentIndex}]`);
      //console.log($components.get());
      $components.setKey(`${applicationId}[${componentIndex}]`, componentToUpdate);
      console.timeEnd('setTime'); // End the timer and log the execution time
      eventDispatcher.emit("component:register");
      setTimeout(() => {
      eventDispatcher.emit("component:refresh");

      }, 100);
      if (save) {
        setTimeout(() => {
          updateComponentHandler(componentToUpdate, applicationId);
        }, 0);
      }
    } else {
      console.log('Attributes are the same, no update needed.', updatedAttributes);
    }
  }

  console.timeEnd('updateComponentAttributesExecutionTime'); // End the timer and log the execution time
}


export function updateComponentAttributeHandlers(
  componentId: string,
  scope: string,
  updatedAttributes: any
) {
  // let componentToUpdate;

  // $components.set([
  //   ...$components.get().map((component: ComponentElement) => {
  //     if (component.uuid === componentId) {
  //       componentToUpdate = component;

  //       component[scope] = {
  //         ...component[scope],
  //         ...updatedAttributes,
  //       };
  //     }
  //     return { ...component };
  //   }),
  // ]);
  // updateComponentHandler(componentToUpdate);

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



export function updateComponentError(
  componentId: string,
  error: { [key: string]: string }
) {
  $components.set([
    ...$components.get().map((component: ComponentElement) => {
      if (component.uuid === componentId) {
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


export async function deleteComponentAction(componentId: string, applicationId: string) {
  const components = $components.get()[applicationId];

  const componentToDelete = components.find(
    (component: ComponentElement) => component.uuid === componentId
  );
  if (componentToDelete) {
    if (componentToDelete.root) {
      removeComponentToCurrentPageAction(componentId);
    } else {
      // Traverse all components and remove the componentId from their childrenIds arrays
      components.forEach((component) => {
        if (component.childrenIds) {
          const originalChildrenIds = [...component.childrenIds];
          component.childrenIds = component.childrenIds.filter(
            (childId) => childId !== componentId
          );

          // If the componentId was removed, dispatch the handler
          if (originalChildrenIds.length !== component.childrenIds.length) {
            updateComponentHandler(component, applicationId);  // Dispatch the handler
          }
        }
      });

      // Save the updated components to the store
      $components.set({
        ...$components.get(),
        [applicationId]: components,
      });
    }

    // Remove the component from the components store
    $components.set({
      ...$components.get(),
      [applicationId]: components.filter(
        (component: ComponentElement) => component.uuid !== componentId
      ),
    });
    await deleteComponentActionHandler(componentId);

    eventDispatcher.emit("component:register");
    eventDispatcher.emit("component:refresh");
  }
}

let clipboardComponent: ComponentElement | null = null;

export function copyComponentAction(componentId: string) {
  const components = $components.get();
  const componentToCopy = components.find((component: ComponentElement) => component.uuid === componentId);

  if (componentToCopy) {
    clipboardComponent = { ...componentToCopy, id: uuidv4() }; // Generate a new ID for the copied component
  }
}


export function pasteComponentAction() {
  // if (clipboardComponent) {
  //   const { id } = $currentPage.get();
  //   clipboardComponent.uuid = uuidv4();
  //   const componentId = clipboardComponent.uuid;
  //   $components.set([
  //     ...$components.get(),
  //     {
  //       ...clipboardComponent,
  //       name: GenerateName(clipboardComponent.component_type),
  //       pageId: id,
  //     } as ComponentElement,
  //   ]);

  //   const currentComponentId = $currentComponentId.get();

  //   if (currentComponentId) {
  //     const currentComponent = $components.get().find(
  //       (component: ComponentElement) => component.uuid === currentComponentId
  //     );

  //     if (currentComponent?.component_type === ComponentType.VerticalContainer) {
  //       addComponentAsChildOf(componentId, currentComponentId);
  //     } else {
  //       addComponentToCurrentPageAction(componentId);
  //     }
  //   } else {
  //     addComponentToCurrentPageAction(componentId);
  //   }
  // }
}


export function addTempApplication(uuid, components) {
  $components.set({
    ...$components.get(),
    [uuid]: components,
  });
}