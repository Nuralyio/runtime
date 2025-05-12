import { persistentAtom } from "@nanostores/persistent";
import { type ComponentElement } from "./interface";
import { atom, computed, deepMap } from "nanostores";
import { currentLoadedApplication } from "$store/ssr/server-data";
import { fillApplicationComponents } from "./helper";
import { eventDispatcher } from "@utils/change-detection";

export interface ComponentStore {
  [key: string]: ComponentElement[];
}

const isServer = typeof window === "undefined";
const initialStates = isServer ? [] : JSON.parse(window["__INITIAL_COMPONENT_STATE__"] ?? "[]");

// Initialize with empty object
const initialState: ComponentStore = isServer ? {} : {};

// Conditionally import components only when on studio path
if (!isServer) {
  const isStudioPath = document.location.pathname.startsWith("/app/studio/");
  
  if (isStudioPath) {
    // Dynamically import only when needed
    import("../../pages/app/studio/studio-microapp/studio-entrypoint.ts").then(studioModule => {
      $components.setKey("1", studioModule.default as any);
      eventDispatcher.emit('component:refresh')
    });
    
    import("../../pages/app/studio/studio-microapp/landing/landing-main-components").then(landingModule => {
      $components.setKey("landing", landingModule.default as any);
    });
  }
}

if (currentLoadedApplication) {
  initialState[currentLoadedApplication.uuid] = initialStates;
}

export const $components = deepMap<ComponentStore>(initialState);
export const $currentComponentId = persistentAtom<string>(
  "currentComponentId",
  null,
  {
    encode: JSON.stringify,
    decode: JSON.parse
  }
);

export const $hoveredComponentId = atom<string>(null);
export const $hoveredComponent = atom<Object>(null);
export const $draggingComponentInfo = atom<Object>(null)

export const $applicationComponents = ($application_id: string) => computed(
  [$components],
  (componentsStore: ComponentStore) => {
    const applicationComponents = Array.from(componentsStore[$application_id] ?? [])?.map(component => ({
      ...component,
    })) ?? [];
    return applicationComponents;
  }
);

computed(
  [$components],
  (componentsStore: ComponentStore) => Object.values(componentsStore).flat().filter(component => !component.parent)
);

export const $componentWithChildren = ($application_id: string) => computed(
  [$applicationComponents($application_id)],
  (components: ComponentElement[]) => fillApplicationComponents(components)
);

export const $selectedComponent = ($application_id: string) => computed(
  [$applicationComponents($application_id), $currentComponentId],
  (components: ComponentElement[], currentComponentId) =>
    components.find(component => component.uuid === currentComponentId) || null
);

export const $componentsByUUIDs = ($application_id: string, uuids: string[]) => computed(
  [$applicationComponents($application_id)],
  (components: ComponentElement[]) =>
    components.filter(component => uuids.includes(component.uuid))
);

export const $runtimeStyles = deepMap<{
  [key: string]: {
    [key: string]: string;
  }
}>({});

export const setcomponentRuntimeStyleAttribute = (componentId: string, attribute: string, value: string) => {
  $runtimeStyles.setKey(componentId, {
    ...$runtimeStyles.get()[componentId],
    [attribute]: value
  });
}

$runtimeStyles.subscribe((styles) => {
})

export const $runtimeStylescomponentStyleByID = ($componentId: string) => computed(
  [$runtimeStyles],
  (styles) => {
    const componentStyles = styles[$componentId] || {};
    return componentStyles;
  }
);

export const clearComponentRuntimeStyleAttributes = () => {
  $runtimeStyles.set({});
}
/**
 * Get all descendant components of a component recursively
 * @param applicationId - The ID of the application
 * @param componentId - Optional: The ID of the parent component. If not provided, returns all components with their descendants
 * @returns An array of components including the parent and all its descendants
 */
export const getAllChildrenRecursive = ($application_id: string, componentId?: string) => computed(
  [$applicationComponents($application_id)],
  (components: ComponentElement[]) => {
    // Create a map for faster component lookup by UUID
    const componentMap = new Map<string, ComponentElement>();
    components.forEach(component => componentMap.set(component.uuid, component));
    
    // Helper function to recursively collect descendants
    const collectDescendants = (component: ComponentElement): ComponentElement[] => {
      if (!component.childrenIds || component.childrenIds.length === 0) {
        return [];
      }
      
      const children: ComponentElement[] = [];
      
      // Get all direct children
      for (const childId of component.childrenIds) {
        const childComponent = componentMap.get(childId);
        if (childComponent) {
          children.push(childComponent);
          // Recursively get descendants of this child
          children.push(...collectDescendants(childComponent));
        }
      }
      
      return children;
    };
    
    // If componentId is provided, find descendants of that specific component
    if (componentId) {
      const parentComponent = componentMap.get(componentId);
      if (!parentComponent) return []; // Component not found
      
      return [parentComponent, ...collectDescendants(parentComponent)];
    }
    
    // If no componentId is provided, get all root components with their descendants
    const rootComponents = components.filter(component => !component.parent);
    const result: ComponentElement[] = [];
    
    for (const rootComponent of rootComponents) {
      result.push(rootComponent);
      result.push(...collectDescendants(rootComponent));
    }
    
    return result;
  }
);

/**
 * Get only the direct children of a component
 * @param applicationId - The ID of the application
 * @param componentId - The ID of the parent component
 * @returns An array of direct children components
 */
export const getDirectChildren = ($application_id: string, componentId: string) => computed(
  [$applicationComponents($application_id)],
  (components: ComponentElement[]) => {
    // Find the parent component
    const parentComponent = components.find(component => component.uuid === componentId);
    if (!parentComponent || !parentComponent.childrenIds) {
      return [];
    }
    
    // Return all components that match the childrenIds
    return components.filter(component => 
      parentComponent.childrenIds.includes(component.uuid)
    );
  }
);