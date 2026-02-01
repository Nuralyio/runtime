import { atom } from 'nanostores';
import { getKvEntry, setKvEntry } from './kv.js';

/**
 * UI Preferences Store
 * Manages user interface preferences with persistence to KV store.
 */

/** Left panel collapsed state */
export const $leftPanelCollapsed = atom<boolean>(false);

const LEFT_PANEL_PREF_KEY = '_user_prefs/left_panel_collapsed';

/**
 * Load left panel preference from KV store
 */
export async function loadLeftPanelPreference(appId: string): Promise<boolean> {
  try {
    const entry = await getKvEntry(appId, LEFT_PANEL_PREF_KEY);
    const collapsed = entry?.value === true;
    $leftPanelCollapsed.set(collapsed);
    return collapsed;
  } catch (error) {
    console.error('Failed to load left panel preference:', error);
    return false;
  }
}

/**
 * Save left panel preference to KV store
 */
export async function saveLeftPanelPreference(appId: string, collapsed: boolean): Promise<void> {
  $leftPanelCollapsed.set(collapsed);
  try {
    await setKvEntry(LEFT_PANEL_PREF_KEY, {
      applicationId: appId,
      scope: 'user',
      value: collapsed,
      isSecret: false,
    });
  } catch (error) {
    console.error('Failed to save left panel preference:', error);
  }
}

/**
 * Toggle left panel collapsed state
 */
export async function toggleLeftPanel(appId: string): Promise<void> {
  const newState = !$leftPanelCollapsed.get();
  await saveLeftPanelPreference(appId, newState);
}
