import { atom, keepMount } from "nanostores";
import { logger } from "@nanostores/logger";
import { persistentAtom } from "@nanostores/persistent";
import { deepMap } from "nanostores";

import { getVar, setVar } from "./context";
import { $pages } from "./page";
import { eventDispatcher } from "utils/change-detection";
const isServer = typeof window === 'undefined';

if(!isServer){
  if(!window['__INITIAL_APPLICATION_STATE__']){
    window['__INITIAL_APPLICATION_STATE__'] = JSON.stringify([]);
  }
}

const coreApplications = [{
  uuid: "1",
  name: "app1",
},
{
  uuid: "2",
  name: "app2",
}]
const initialState = isServer ? [] : JSON.parse(window['__INITIAL_APPLICATION_STATE__'] ?? []);

const initialAppState = isServer ? [] : JSON.parse(window['__INITIAL_CURRENT_APPLICATION_STATE__'] ?? null);
export const $applications = atom<any>([...initialState, ...coreApplications]);
export const $currentApplication = atom<any>(initialAppState);
export const $applicationPermission = atom<any>([]);
export const $values = deepMap<any>({});

function deepEqual(obj1, obj2) {
  return JSON.stringify(obj1) === JSON.stringify(obj2);
}

export function setValue(componentId, key, value) {
  const componentValues = $values.get(componentId)[componentId] || {};
  
  // Perform a deep comparison of the current and new values
  if (!deepEqual(componentValues[key], value)) {
    $values.setKey(componentId, { ...componentValues, [key]: value });
    
    // Emit the refresh event only if the value has changed
  }
}

export const $resizing = atom<Boolean>(false);

export const $permissionsState = atom<any>({ message : ""});

interface Tab {
  id: string;
  name: string;
  type?: string;
  detail ? : any;
}

export const $editorState = persistentAtom<{ currentTab: any, tabs: Tab[] }>("$editorState", {
  currentTab: {},
  tabs: [{
    id: "0",
    name: "pages",
    type: "page"
  }]
}, {
  encode: JSON.stringify,
  decode: JSON.parse,
});


export const $showCreateApplicationModal = atom<Boolean>(false);
export const $showShareApplicationModal = atom<boolean>(false);


keepMount($resizing)


if (!isServer) {
    const currentApplication = $currentApplication.get();
      console.log(currentApplication)
      setVar('global', `currentEditingApplication`, currentApplication);
}
