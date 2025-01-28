import { atom, deepMap, keepMount } from "nanostores";
import { persistentAtom } from "@nanostores/persistent";

import { setVar } from "./context";

const isServer = typeof window === "undefined";

if (!isServer) {
  if (!window["__INITIAL_APPLICATION_STATE__"]) {
    window["__INITIAL_APPLICATION_STATE__"] = JSON.stringify([]);
  }
}

const coreApplications = [{
  uuid: "1",
  name: "app1"
},
  {
    uuid: "2",
    name: "app2"
  },
  {
    uuid: "landing",
    name: "landing"
  }
];
const initialState = isServer ? [] : JSON.parse(window["__INITIAL_APPLICATION_STATE__"] ?? []);

const initialAppState = isServer ? [] : JSON.parse(window["__INITIAL_CURRENT_APPLICATION_STATE__"] ?? null);
export const $applications = atom<any>([...initialState, ...coreApplications]);
export const $currentApplication = atom<any>(initialAppState);
export const $applicationPermission = atom<any>([]);
export const $values = deepMap<any>({});
import deepEqual from "fast-deep-equal";


export function setValue(componentId, key, value) {
  const componentValues = $values.get()[componentId] || {};
  // Perform a deep comparison of the current and new values
  if (!deepEqual(componentValues[key], value)) {
    $values.setKey(componentId, { ...componentValues, [key]: value });

    // Emit the refresh event only if the value has changed
  }
}

export const $resizing = atom<Boolean>(false);

export const $permissionsState = atom<any>({ message: "" });

interface Tab {
  id: string;
  name: string;
  type?: string;
  detail?: any;
}

export const $editorState = atom<{ currentTab: any, tabs: Tab[] }>( {
  currentTab:{
    id: "0",
    label: "Page editor",
    type: "page"
  },
  tabs: [{
    id: "0",
    label: "Page editor",
    type: "page"
  },
   ]
});


export const $showCreateApplicationModal = atom<Boolean>(false);
export const $showShareApplicationModal = atom<boolean>(false);


keepMount($resizing);


if (!isServer) {
  const currentApplication = $currentApplication.get();
  setVar("global", `currentEditingApplication`, currentApplication);
}
