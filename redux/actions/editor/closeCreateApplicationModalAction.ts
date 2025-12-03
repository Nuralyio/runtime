import { $showCreateApplicationModal } from '../../store/apps';

export function closeCreateApplicationModalAction() {
  $showCreateApplicationModal.set(false);
}