import { $showShareApplicationModal } from "@shared/redux/store/apps";

export function closeShareApplicationModalAction() {
  $showShareApplicationModal.set(false);
}