import { $showShareApplicationModal } from "$store/apps.ts";

export function closeShareApplicationModalAction() {
  $showShareApplicationModal.set(false);
}