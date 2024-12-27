import { $showShareApplicationModal } from "$store/apps.ts";

export function showShareApplicationModalAction() {
  $showShareApplicationModal.set(true);
}