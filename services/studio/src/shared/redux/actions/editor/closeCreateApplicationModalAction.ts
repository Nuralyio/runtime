import { $showCreateApplicationModal } from "@shared/redux/store/apps";

export function closeCreateApplicationModalAction() {
  $showCreateApplicationModal.set(false);
}