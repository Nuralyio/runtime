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
      eventDispatcher.emit('component:refresh:')
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