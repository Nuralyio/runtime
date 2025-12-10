import { $showCreateApplicationModal } from '../../store/apps';

export function showCreateApplicationModalAction() {
  $showCreateApplicationModal.set(true);
}