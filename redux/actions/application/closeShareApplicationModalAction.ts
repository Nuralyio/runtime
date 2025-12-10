import { $showShareApplicationModal } from '../../store/apps';

export function closeShareApplicationModalAction() {
  $showShareApplicationModal.set(false);
}