import { atom, keepMount } from "nanostores";
import { logger } from "@nanostores/logger";
import { persistentAtom } from "@nanostores/persistent";
import { getVar, setVar } from "./context/context-store";
import { $pages } from "./page/page-store";
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
    setTimeout(() => {
      setVar('global', `currentEditingApplication`, currentApplication);
    },0)
   
}