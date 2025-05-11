import { atom, deepMap, keepMount, onMount } from "nanostores";
import { setVar } from "./context";
import deepEqual from "fast-deep-equal";

// Constants
const isServer = typeof window === "undefined";
const INITIAL_APP_STATE_KEY = "__INITIAL_APPLICATION_STATE__";
const INITIAL_CURRENT_APP_STATE_KEY = "__INITIAL_CURRENT_APPLICATION_STATE__";

// Core application definitions
const coreApplications = [
  { uuid: "1", name: "app1" },
  { uuid: "2", name: "app2" },
  { uuid: "landing", name: "landing" }
];

// Initialize state based on environment
if (!isServer && !window[INITIAL_APP_STATE_KEY]) {
  window[INITIAL_APP_STATE_KEY] = JSON.stringify([]);
}

// Parse initial states with fallbacks
const initialState = isServer 
  ? [] 
  : JSON.parse(window[INITIAL_APP_STATE_KEY] || "[]");

const initialAppState = isServer 
  ? null 
  : JSON.parse(window[INITIAL_CURRENT_APP_STATE_KEY] || "null");

// Store definitions
export const $applications = atom([...initialState, ...coreApplications]);
export const $currentApplication = atom(initialAppState);
export const $applicationPermission = atom([]);
export const $values = deepMap({});
export const $resizing = atom(false);
export const $permissionsState = atom({ message: "" });
export const $showCreateApplicationModal = atom(false);
export const $showShareApplicationModal = atom(false);

// Editor state definition with proper typing
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
    }
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

// Keep resizing state mounted
keepMount($resizing);

// Setup application state synchronization
onMount($applications, () => {
  if (isServer) return;
  
  const currentApplication = $currentApplication.get();
  if (currentApplication) {
    setVar("global", "currentEditingApplication", currentApplication);
  }
});