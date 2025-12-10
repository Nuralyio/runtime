import { atom } from "nanostores";
import type { Provider } from "../handlers/providers/interface";
import { persistentAtom } from "@nanostores/persistent";


export const $providers = atom<Provider[]>([]);

export const $activeTables = persistentAtom<{ [providerId: string]: string }>("$activeTables", {}, {
  encode: JSON.stringify,
  decode: JSON.parse
});

// Define a function to set the active table for a provider
export function setActiveTable(providerId: string, tableName: string) {
  const activeTables = $activeTables.get();
  activeTables[providerId] = tableName;
  $activeTables.set(activeTables);
}

// Define a function to get the active table for a provider
export function getActiveTable(providerId: string) {
  const activeTables = $activeTables.get();
  return activeTables[providerId] || null;
}
