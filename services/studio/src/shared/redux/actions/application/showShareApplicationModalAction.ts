import { $showShareApplicationModal } from "@shared/redux/store/apps";

export function showShareApplicationModalAction() {
  $showShareApplicationModal.set(true);
}