import { $showCreateApplicationModal } from "@shared/redux/store/apps";

export function showCreateApplicationModalAction() {
  $showCreateApplicationModal.set(true);
}