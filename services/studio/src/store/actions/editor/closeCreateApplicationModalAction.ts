import { $showCreateApplicationModal } from "$store/apps.ts";

export function closeCreateApplicationModalAction() {
  $showCreateApplicationModal.set(false);
}