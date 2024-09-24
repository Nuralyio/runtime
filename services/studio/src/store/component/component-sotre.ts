import { persistentAtom } from "@nanostores/persistent";
import { type ComponentElement, type DraggingComponentInfo } from "./interface";
import { atom, computed, deepMap } from "nanostores";
import studioComponents from "./studio-components";
import landingComponents from "./landing/landing-main-components";
import { currentLoadedApplication } from "$store/ssr/server-data";
import { fillComponentChildren } from "./helper";
import { logger } from "@nanostores/logger";

export interface ComponentStore {
  [key: string]: ComponentElement[];
}

// Determine if the code is running on the server
const isServer = typeof window === 'undefined';

// Parse initial component states from the window object if running on the client
if(!isServer){
}
const initialStates = isServer ? [] : JSON.parse(window['__INITIAL_COMPONENT_STATE__'] ?? '[]');

// Initialize the state with default components for the first application
const initialState: ComponentStore = isServer ? {} : {
  "1": studioComponents as any,
  "landing": landingComponents as any,
};

if (currentLoadedApplication) {
  initialState[currentLoadedApplication.uuid] = initialStates;
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

// Helper function to fill component children
const fillApplicationComponents = (components: ComponentElement[]) =>
  components.map(component => fillComponentChildren(components, component));

export const $applicationComponents = ($applicationId: string) => computed(
  [$components],
  (componentsStore: ComponentStore) => {
    const applicationComponents = Array.from(componentsStore[$applicationId] ?? [])?.map(component => ({
      ...component,
      applicationId: $applicationId
    })) ?? [];
    return fillApplicationComponents(applicationComponents);
  }
);

export const $flattenedComponents = computed(
  [$components],
  (componentsStore: ComponentStore) => Object.values(componentsStore).flat().filter(component => !component.parent)
);

export const $componentWithChildrens = ($applicationId: string) => computed(
  [$applicationComponents($applicationId)],
  (components: ComponentElement[]) => fillApplicationComponents(components)
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


// logger({ $components, $currentComponentId, $draggingComponentInfo, $applicationComponents, $flattenedComponents, $componentWithChildrens, $selectedComponent, $hoveredComponent });