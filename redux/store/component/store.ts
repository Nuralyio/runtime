import { persistentAtom } from "@nanostores/persistent";
import { type ComponentElement } from "./component.interface";
import { atom, computed, deepMap } from "nanostores";
import { currentLoadedApplication } from '../ssr/server-data';
import { fillApplicationComponents } from "./helper";
import { eventDispatcher } from '../../../../runtime/utils/change-detection.ts';

export interface ComponentStore {
  [key: string]: ComponentElement[];
}

const isServer = typeof window === "undefined";
const initialStates = isServer ? [] : JSON.parse(window["__INITIAL_COMPONENT_STATE__"] ?? "[]");

// Initialize with empty object
const initialState: ComponentStore = {};

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
export const $draggingComponentInfo = atom<Object>(null);

// Track which slot is active for insertion (used by modal and other multi-slot components)
export const $activeSlot = atom<string | null>(null);

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

// Define the type for runtime values
export interface RuntimeValuesStore {
  [key: string]: {
    [key: string]: any;
  }
}

// Initialize with empty object
export const $runtimeValues = deepMap<RuntimeValuesStore>({});

/**
 * Set a runtime value for a component
 * @param componentId - The ID of the component
 * @param key - The key for the value
 * @param value - The value to set
 */
export const setComponentRuntimeValue = (componentId: string, key: string, value: any) => {
  if (!componentId) {
    console.error('Cannot set runtime value: componentId is undefined');
    return;
  }
  $runtimeValues.setKey(componentId, {
    ...$runtimeValues.get()[componentId],
    [key]: value
  });
  
  // Emit an event to notify subscribers about the change
  eventDispatcher.emit('component:value:change', {
    componentId,
    key,
    value
  });
};

/**
 * Set multiple runtime values for a component at once
 * @param componentId - The ID of the component
 * @param values - Object containing key-value pairs to set
 */
export const setComponentRuntimeValues = (componentId: string, values: Record<string, any>) => {
  $runtimeValues.setKey(componentId, {
    ...$runtimeValues.get()[componentId],
    ...values
  });
  
  // Emit an event to notify subscribers about the changes
  eventDispatcher.emit('component:values:change', {
    componentId,
    values
  });
};

/**
 * Get a computed store of all runtime values for a specific component
 * @param componentId - The ID of the component
 * @returns A computed store with the component's runtime values
 */
export const $componentRuntimeValuesById = (componentId: string) => computed(
  [$runtimeValues],
  (values) => {
    return values[componentId] || {};
  }
);

/**
 * Get a computed store for a specific runtime value of a component
 * @param componentId - The ID of the component
 * @param key - The key of the value to get
 * @returns A computed store with the specific runtime value
 */
export const $componentRuntimeValueByKey = (componentId: string, key: string) => computed(
  [$runtimeValues],
  (values) => {
    const componentValues = values[componentId] || {};
    return componentValues[key];
  }
);

/**
 * Clear all runtime values for a specific component
 * @param componentId - The ID of the component
 */
export const clearComponentRuntimeValues = (componentId: string) => {
  $runtimeValues.setKey(componentId, {});
  
  // Emit an event to notify subscribers about the clear operation
  eventDispatcher.emit('component:values:clear', {
    componentId
  });
};

/**
 * Clear a specific runtime value for a component
 * @param componentId - The ID of the component
 * @param key - The key of the value to clear
 */
export const clearComponentRuntimeValue = (componentId: string, key: string) => {
  const currentValues = { ...$runtimeValues.get()[componentId] };
  if (currentValues && key in currentValues) {
    delete currentValues[key];
    $runtimeValues.setKey(componentId, currentValues);
    
    // Emit an event to notify subscribers about the removal
    eventDispatcher.emit('component:value:remove', {
      componentId,
      key
    });
  }
};

/**
 * Clear all runtime values for all components
 */
export const clearAllRuntimeValues = () => {
  $runtimeValues.set({});
  
  // Emit an event to notify subscribers that all values have been cleared
  eventDispatcher.emit('component:values:clear:all');
};

// Subscribe to changes in runtime values for debugging or side effects
$runtimeValues.subscribe((values) => {
  // This can be used for logging or triggering other side effects
  // when runtime values change
});

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
      if (!component.children_ids || component.children_ids.length === 0) {
        return [];
      }
      
      const children: ComponentElement[] = [];
      
      // Get all direct children
      for (const childId of component.children_ids) {
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
    if (!parentComponent || !parentComponent.children_ids) {
      return [];
    }
    
    // Return all components that match the children_ids
    return components.filter(component => 
      parentComponent.children_ids.includes(component.uuid)
    );
  }
);

export const $componentById = ($application_id: string, componentId: string) => computed(
  [$applicationComponents($application_id)],
  (components: ComponentElement[]) =>
    components.find(component => component.uuid === componentId) || null
);