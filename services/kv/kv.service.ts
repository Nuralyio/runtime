/**
 * KV Service
 * Single source of truth for all KV HTTP operations.
 * No UI component should call fetch() for KV endpoints directly — use this service.
 */

import { APIS_URL } from '../constants';
import type {
  KvEntry,
  KvEntryVersion,
  FetchEntriesOptions,
  SetEntryRequest,
} from './kv.types';

// ============================================
// Core CRUD
// ============================================

/**
 * Fetch all entries without applicationId filter
 */
export async function getAllKvEntries(prefix?: string): Promise<KvEntry[] | null> {
  try {
    const url = APIS_URL.getAllKvEntries(prefix);
    const response = await fetch(url, { credentials: 'include' });
    if (!response.ok) throw new Error('Failed to fetch all entries');
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch all KV entries:', error);
    return null;
  }
}

/**
 * Fetch entries for a specific application
 */
export async function fetchEntries(appId: string, options?: FetchEntriesOptions): Promise<KvEntry[] | null> {
  try {
    const url = APIS_URL.getKvEntries(appId, options?.scope, options?.scopedResourceId, options?.prefix);
    const response = await fetch(url, { credentials: 'include' });
    if (!response.ok) throw new Error('Failed to fetch entries');
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch KV entries:', error);
    return null;
  }
}

/**
 * Get a single entry by keyPath
 */
export async function fetchEntry(appId: string, keyPath: string): Promise<KvEntry | null> {
  try {
    const url = APIS_URL.getKvEntry(appId, keyPath);
    const response = await fetch(url, { credentials: 'include' });
    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error('Failed to fetch entry');
    }
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch KV entry:', error);
    return null;
  }
}

/**
 * Set (create or update) an entry
 */
export async function setEntry(keyPath: string, request: SetEntryRequest): Promise<KvEntry | null> {
  try {
    const url = APIS_URL.setKvEntry(keyPath);
    const response = await fetch(url, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(request),
    });
    if (!response.ok) throw new Error('Failed to set entry');
    return await response.json();
  } catch (error) {
    console.error('Failed to set KV entry:', error);
    return null;
  }
}

/**
 * Delete an entry
 */
export async function deleteEntry(appId: string, keyPath: string): Promise<boolean> {
  try {
    const url = APIS_URL.deleteKvEntry(appId, keyPath);
    const response = await fetch(url, {
      method: 'DELETE',
      credentials: 'include',
    });
    if (!response.ok) throw new Error('Failed to delete entry');
    return true;
  } catch (error) {
    console.error('Failed to delete KV entry:', error);
    return false;
  }
}

// ============================================
// Secrets
// ============================================

/**
 * Rotate a secret value (creates a new version)
 */
export async function rotateSecret(appId: string, keyPath: string, newValue: any): Promise<KvEntry | null> {
  try {
    const url = APIS_URL.rotateKvSecret(appId, keyPath);
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ value: newValue }),
    });
    if (!response.ok) throw new Error('Failed to rotate secret');
    return await response.json();
  } catch (error) {
    console.error('Failed to rotate KV secret:', error);
    return null;
  }
}

/**
 * Get version history for an entry
 */
export async function getVersionHistory(appId: string, keyPath: string): Promise<KvEntryVersion[] | null> {
  try {
    const url = APIS_URL.getKvVersions(appId, keyPath);
    const response = await fetch(url, { credentials: 'include' });
    if (!response.ok) throw new Error('Failed to fetch version history');
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch KV version history:', error);
    return null;
  }
}

/**
 * Rollback an entry to a specific version
 */
export async function rollbackEntry(appId: string, keyPath: string, version: number): Promise<KvEntry | null> {
  try {
    const url = APIS_URL.rollbackKvEntry(appId, keyPath);
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ version }),
    });
    if (!response.ok) throw new Error('Failed to rollback');
    return await response.json();
  } catch (error) {
    console.error('Failed to rollback KV entry:', error);
    return null;
  }
}

// ============================================
// User Preferences (system-level KV)
// ============================================

const SYSTEM_APP_ID = '_system';
const USER_PREFERENCES_PREFIX = 'user-preferences';

/**
 * Get a user preference
 */
export async function getUserPreference<T = any>(keyPath: string): Promise<T | null> {
  try {
    const fullKeyPath = `${USER_PREFERENCES_PREFIX}/${keyPath}`;
    const url = `${APIS_URL.getKvEntry(SYSTEM_APP_ID, fullKeyPath)}&scope=user`;
    const response = await fetch(url, { credentials: 'include' });
    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error('Failed to fetch user preference');
    }
    const entry = await response.json();
    return entry?.value ?? null;
  } catch (error) {
    console.error('Failed to get user preference:', error);
    return null;
  }
}

/**
 * Set a user preference
 */
export async function setUserPreference<T = any>(keyPath: string, value: T): Promise<boolean> {
  try {
    const fullKeyPath = `${USER_PREFERENCES_PREFIX}/${keyPath}`;
    const url = APIS_URL.setKvEntry(fullKeyPath);
    const response = await fetch(url, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        applicationId: SYSTEM_APP_ID,
        scope: 'user',
        value,
      }),
    });
    if (!response.ok) throw new Error('Failed to set user preference');
    return true;
  } catch (error) {
    console.error('Failed to set user preference:', error);
    return false;
  }
}

/**
 * Delete a user preference
 */
export async function deleteUserPreference(keyPath: string): Promise<boolean> {
  try {
    const fullKeyPath = `${USER_PREFERENCES_PREFIX}/${keyPath}`;
    const url = `${APIS_URL.deleteKvEntry(SYSTEM_APP_ID, fullKeyPath)}&scope=user`;
    const response = await fetch(url, {
      method: 'DELETE',
      credentials: 'include',
    });
    if (!response.ok && response.status !== 404) {
      throw new Error('Failed to delete user preference');
    }
    return true;
  } catch (error) {
    console.error('Failed to delete user preference:', error);
    return false;
  }
}
