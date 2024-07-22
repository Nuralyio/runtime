import { persistentAtom } from "@nanostores/persistent";
import { ComponentType, type ComponentElement, type DraggingComponentInfo } from "./interface";
import { atom, computed, deepMap, keepMount } from "nanostores";
import { $currentPage, $pages } from "$store/page/store";
import studioComponents from "./studio-components";

// Determine if the code is running on the server
const isServer = typeof window === 'undefined';

// Parse initial component states from the window object if running on the client
const initialStates = isServer ? [] : JSON.parse(window['__INITIAL_COMPONENT_STATE__'] ?? []);

// Set the initial state for components
const initialState = isServer ? {} : {
  "1": studioComponents as ComponentElement[], // Default components for the first application
  "fcd5b7f8-b7b6-4fd7-97a7-740ad68c351b": initialStates
};

interface ComponentStore {
  [key: string]: ComponentElement[];
}

export const $components = deepMap<ComponentStore>(initialState);

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

// Helper function to iteratively fill component children
const fillComponentChildren = (
  components: ComponentElement[],
  component: ComponentElement
): ComponentElement => {
  const componentMap = new Map(components.map(comp => [comp.uuid, comp]));
  const stack: ComponentElement[] = [component];

  while (stack.length > 0) {
    const currentComponent = stack.pop();

    if (!currentComponent.childrens) currentComponent.childrens = [];

    if (currentComponent.childrenIds) {
      currentComponent.childrens = currentComponent.childrenIds
        .map((componentChildId: string) => componentMap.get(componentChildId))
        .filter(Boolean);

      stack.push(...currentComponent.childrens);
    }
  }

  return component;
};

export const $applicationComponents = ($applicationId: string) => computed(
  [$components],
  (componentsStore: ComponentStore) => {
    const applicationComponents = componentsStore[$applicationId]?.map(component => ({
      ...component,
      applicationId: $applicationId
    })) ?? [];
    return applicationComponents.map(component =>
      fillComponentChildren(applicationComponents, component)
    );
  }
);

export const $flattenedComponents = computed(
  [$components],
  (componentsStore: ComponentStore) => Object.values(componentsStore).flat().filter(component => !component.parent)
);

export const $componentWithChildrens = ($applicationId: string) => computed(
  [$applicationComponents($applicationId)],
  (components: ComponentElement[]) => components.map(component => fillComponentChildren(components, component))
);

export const $AllcomponentWithChildrens = () => computed(
  [$flattenedComponents],
  (components: ComponentElement[]) => components.map(component => fillComponentChildren(components, component))
);

export const $selectedComponent = ($applicationId: string) => computed(
  [$applicationComponents($applicationId), $currentComponentId],
  (components: ComponentElement[], currentComponentId) =>
    components.find(component => component.uuid === currentComponentId) || null
);

export const $hoveredComponent = ($applicationId: string) => computed(
  [$applicationComponents($applicationId), $hoveredComponentId],
  (components: ComponentElement[], hoveredComponentId) =>
    components.find(component => component.uuid === hoveredComponentId) || null
);

export const $currentPageComponents = ($applicationId: string) => computed(
  [$componentWithChildrens($applicationId), $currentPage],
  (components: ComponentElement[], currentPage) =>
    currentPage?.component_ids
      ?.map(componentId => components.find(component => component.uuid === componentId))
      .filter(Boolean)
);

export const $pagesWithComponents = ($applicationId: string) => computed(
  [$componentWithChildrens($applicationId), $pages],
  (componentWithChildren, pages) =>
    pages?.map(page => ({
      ...page,
      components: page.component_ids
        .map(componentId => componentWithChildren.find(component => component.uuid === componentId))
        .filter(Boolean)
    })) ?? []
);

keepMount($currentComponentId);