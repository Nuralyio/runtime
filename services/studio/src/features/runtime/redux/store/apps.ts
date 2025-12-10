import { atom, deepMap, keepMount, onMount } from "nanostores";
import { setVar } from "./context";
import deepEqual from "fast-deep-equal";

/**
 * Environment detection flag
 * @type {boolean}
 */
const isServer: boolean = typeof window === "undefined";

/**
 * Keys for storing application state in the window object
 * @type {string}
 */
const INITIAL_APP_STATE_KEY = "__INITIAL_APPLICATION_STATE__";
const INITIAL_CURRENT_APP_STATE_KEY = "__INITIAL_CURRENT_APPLICATION_STATE__";

/**
 * Core application definitions that are always available
 * @type {Array<{uuid: string, name: string}>}
 */
const coreApplications = [
  { uuid: "1", name: "app1" },
  { uuid: "2", name: "app2" },
  { uuid: "landing", name: "landing" }
];

// Initialize state based on environment
if (!isServer && !window[INITIAL_APP_STATE_KEY]) {
  window[INITIAL_APP_STATE_KEY] = JSON.stringify([]);
}

/**
 * Parse initial application states with fallbacks
 * @type {Array<{uuid: string, name: string}>}
 */
const initialState = isServer 
  ? [] 
  : JSON.parse(window[INITIAL_APP_STATE_KEY] || "[]");

/**
 * Parse initial current application state with fallback
 * @type {Object|null}
 */
const initialAppState: object | null = isServer 
  ? null 
  : JSON.parse(window[INITIAL_CURRENT_APP_STATE_KEY] || "null");

/**
 * Store for all available applications
 * @type {import('nanostores').Atom<Array<{uuid: string, name: string}>>}
 */
export const $applications = atom([...initialState, ...coreApplications]);

/**
 * Store for the currently selected application
 * @type {import('nanostores').Atom<Object|null>}
 */
export const $currentApplication = atom(initialAppState);

/**
 * Store for application permissions
 * @type {import('nanostores').Atom<Array>}
 */
export const $applicationPermission = atom([]);

/**
 * Store for component values
 * @type {import('nanostores').DeepMap<Record<string, Record<string, any>>>}
 */
export const $values = deepMap<Record<string, Record<string, any>>>({});

/**
 * Store for tracking resize operations
 * @type {import('nanostores').Atom<boolean>}
 */
export const $resizing = atom(false);

/**
 * Store for permission state messages
 * @type {import('nanostores').Atom<{message: string}>}
 */
export const $permissionsState = atom({ message: "" });

/**
 * Store for create application modal visibility
 * @type {import('nanostores').Atom<boolean>}
 */
export const $showCreateApplicationModal = atom(false);

/**
 * Store for share application modal visibility
 * @type {import('nanostores').Atom<boolean>}
 */
export const $showShareApplicationModal = atom(false);

/**
 * Store for editor state with tab management
 * @type {import('nanostores').Atom<{currentTab: {id: string, label: string, type: string}, tabs: Array<{id: string, label: string, type: string}>}>}
 */
export const $editorState = atom({
  currentTab: {
    id: "0",
    label: "Page editor",
    type: "page"
  },
  tabs: [
    {
      id: "0",
      label: "Page editor",
      type: "page"
    },
    // {
    //   id: "2",
    //   label: "flow editor",
    //   type: "flow"
    // },
    // {
    //   id: "3",
    //   label: "Database manager",
    //   type: "database"
    // }
  ]
});

/**
 * Sets a value for a component with change detection
 * @param {string} componentId - The component identifier
 * @param {string} key - The key to set
 * @param {any} value - The value to set
 */
export function setValue(componentId, key, value) {
  const values = $values.get();
  const componentValues = values[componentId] || {};
  
  // Only update if value has changed (deep comparison)
  if (!deepEqual(componentValues[key], value)) {
    $values.setKey(componentId, { 
      ...componentValues, 
      [key]: value 
    });
  }
}

/**
 * Keep resizing state mounted to ensure it persists across rerenders
 */
keepMount($resizing);

/**
 * Setup application state synchronization when mounted
 */
onMount($applications, () => {
  if (isServer) return;
  
  const currentApplication = $currentApplication.get();
  if (currentApplication) {
    setVar("global", "currentEditingApplication", currentApplication);
  }
});