/**
 * Presence Store
 * Nanostores-based state management for presence
 */

import { atom, computed } from 'nanostores';
import type { PresenceUser, PresenceState } from './presence-types';

// Main presence state
export const $presenceState = atom<PresenceState>({
  connected: false,
  currentApplicationId: null,
  users: [],
});

// Computed: just the users array for easy subscription
export const $presenceUsers = computed($presenceState, (state) => state.users);

// Computed: connection status
export const $presenceConnected = computed($presenceState, (state) => state.connected);

// Computed: other users (excluding current user)
export const $otherPresenceUsers = computed($presenceState, (state) => {
  const currentUserId = (window as any).__CURRENT_USER__?.uuid;
  if (!currentUserId) return state.users;
  return state.users.filter(u => u.userId !== currentUserId);
});

// Computed: users on the same page
export const $usersOnCurrentPage = computed($presenceState, (state) => {
  const currentPageId = (window as any).__CURRENT_PAGE_ID__;
  if (!currentPageId) return [];
  return state.users.filter(u => u.metadata.pageId === currentPageId);
});

// Actions
export function setPresenceConnected(connected: boolean): void {
  const current = $presenceState.get();
  $presenceState.set({ ...current, connected });
}

export function setCurrentApplicationId(applicationId: string | null): void {
  const current = $presenceState.get();
  $presenceState.set({ ...current, currentApplicationId: applicationId });
}

export function setPresenceUsers(users: PresenceUser[]): void {
  const current = $presenceState.get();
  $presenceState.set({ ...current, users });
}

export function addPresenceUser(user: PresenceUser): void {
  const current = $presenceState.get();
  // Don't add duplicates
  const exists = current.users.some(u => u.socketId === user.socketId);
  if (!exists) {
    $presenceState.set({
      ...current,
      users: [...current.users, user],
    });
  }
}

export function removePresenceUser(socketId: string): void {
  const current = $presenceState.get();
  $presenceState.set({
    ...current,
    users: current.users.filter(u => u.socketId !== socketId),
  });
}

export function updatePresenceUser(user: PresenceUser): void {
  const current = $presenceState.get();
  $presenceState.set({
    ...current,
    users: current.users.map(u =>
      u.socketId === user.socketId ? user : u
    ),
  });
}

export function clearPresenceUsers(): void {
  const current = $presenceState.get();
  $presenceState.set({ ...current, users: [] });
}
