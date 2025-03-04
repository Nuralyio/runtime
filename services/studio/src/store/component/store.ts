import { persistentAtom } from "@nanostores/persistent";
import { type ComponentElement, type DraggingComponentInfo } from "./interface";
import { atom, computed, deepMap } from "nanostores";
import studioComponents from "../../pages/app/studio/studio-microapp/studio-entrypoint.ts";
import landingComponents from "../../pages/app/studio/studio-microapp/landing/landing-main-components";
import { currentLoadedApplication } from "$store/ssr/server-data";
import { extractChildresIds, fillApplicationComponents } from "./helper";

export interface ComponentStore {
  [key: string]: ComponentElement[];
}

const isServer = typeof window === "undefined";

const initialStates = isServer ? [] : JSON.parse(window["__INITIAL_COMPONENT_STATE__"] ?? "[]");

const initialState: ComponentStore = isServer ? {} : {
  "1": studioComponents as any,
  "landing": landingComponents as any
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