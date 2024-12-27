import { $showCreateApplicationModal } from "$store/apps.ts";

export function showCreateApplicationModalAction() {
  $showCreateApplicationModal.set(true);
}