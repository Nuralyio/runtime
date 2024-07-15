import { persistentAtom } from "@nanostores/persistent";
import { ComponentType, type ComponentElement, type DraggingComponentInfo } from "./interface";
import { atom, computed, keepMount } from "nanostores";
import { $currentPage, $pages } from "$store/page/store";
import { logger } from "@nanostores/logger";
import studioComponents from "./studio-components";
const isServer = typeof window === 'undefined';
const initialStates = isServer ? [] : JSON.parse(window['__INITIAL_COMPONENT_STATE__'] ?? []);


const initialState = isServer ? {} : null ?? {
  "1": studioComponents as ComponentElement[], // Default components for the first application,
  "fcd5b7f8-b7b6-4fd7-97a7-740ad68c351b"  : initialStates
};

// Define the ComponentStore interface
interface ComponentStore {
  [key: string]: ComponentElement[];
}

export const $components = atom<ComponentStore>(
  initialState
);

export const $currentComponentId = persistentAtom<string>(
  "currentComponentId",
  null,
  {
    encode: JSON.stringify,
    decode: JSON.parse,
  }
);

export const $hoveredComponentId = atom<string>(null);

export const $draggingComponentInfo = persistentAtom<DraggingComponentInfo>(
  "draggingComponentInfo",
  null,
  {
    encode: JSON.stringify,
    decode: JSON.parse,
  }
);
// Selector for components of a specific application
export const $applicationComponents = ($applicationId: string) => computed(
  [$components],
  (componentsStore: ComponentStore) => {
    const applicationComponents = (componentsStore[$applicationId] || []).map(component => ({
      ...component,
      applicationId: $applicationId
    }))
    return applicationComponents.map((component: ComponentElement) =>
      fillComponentChildrens(applicationComponents, component)
    );
  }
);


export const $flattenedComponents = computed(
  [$components],
  (componentsStore: ComponentStore) => {
    // Flattening the main components without considering their children
    const allComponents: ComponentElement[] = Object.values(componentsStore).flat();
    return allComponents.filter(component => !component.parent); // Only main components
  }
);



// Computes components with their children for a specific application
export const $componentWithChildrens = ($applicationId: string) => computed(
  [$applicationComponents($applicationId)],
  (components: ComponentElement[]) => {
    return components.map((component: ComponentElement) =>
      fillComponentChildrens(components, component)
    );
  }
);



// Computes components with their children for a specific application
export const $AllcomponentWithChildrens = () => computed(
  [$flattenedComponents],
  (components: ComponentElement[]) => {
    return components.map((component: ComponentElement) =>
      fillComponentChildrens(components, component)
    );
  }
);

// Selected component within a specific application
export const $selectedComponent = ($applicationId: string) => computed(
  [$applicationComponents($applicationId), $currentComponentId],
  (components: ComponentElement[], currentComponentId) => {
    return (
      components.find(
        (component: ComponentElement) => component.uuid === currentComponentId
      ) || null
    );
  }
);

// Hovered component within a specific application
export const $hoveredComponent = ($applicationId: string) => computed(
  [$applicationComponents($applicationId), $hoveredComponentId],
  (components: ComponentElement[], hoveredComponentId) => {
    return (
      components.find(
        (component: ComponentElement) => component.uuid === hoveredComponentId
      ) || null
    );
  }
);

// Components of the current page within a specific application
export const $currentPageComponents = ($applicationId: string) => computed(
  [$componentWithChildrens($applicationId), $currentPage],
  (components: ComponentElement[], currentPage) => {
    return currentPage?.component_ids
      ?.map((componentId) =>
        components.find(
          (component: ComponentElement) => component.uuid === componentId
        )
      )
      .filter((component) => component);
  }
);

// Pages with their components within a specific application
export const $pagesWithComponents = ($applicationId: string) => computed(
  [$componentWithChildrens($applicationId), $pages],
  (componentWithChildrens, pages) => {
    return (pages || []).map((page) => {
      page.components = page.component_ids.map((componentId) =>
        componentWithChildrens.find(
          (component: ComponentElement) => component.uuid === componentId
        )
      );
      return page;
    });
  }
);
const fillComponentChildrens = (
  components: ComponentElement[],
  component: ComponentElement,
  parent: ComponentElement | null = null // Add parent parameter with default value
): ComponentElement => {
  const componentMap = new Map(components.map(comp => [comp.uuid, comp]));

  const recursiveFill = (component: ComponentElement, parent: ComponentElement | null): ComponentElement => {
    if (!component.childrens) {
      component.childrens = [];
    }
    if (component.childrenIds) {
      component.childrens = component.childrenIds.map((componentChildId: string) => {
        const foundComponent = componentMap.get(componentChildId);
        if (foundComponent) {
          return recursiveFill(foundComponent, component);
        }
        return null; // Handle the case where a child component is not found
      }).filter(Boolean); // Remove null values if any
    }

    // Add the parent attribute to the current component
    component.parent = structuredClone(parent);

    return component;
  };

  return recursiveFill(component, parent);
};

keepMount($currentComponentId);

/*
logger({
  components: $components,
  currentComponentId: $currentComponentId,
  componentWithChildrens: $componentWithChildrens,
});
*/
