import { $showShareApplicationModal } from '../../store/apps';

export function showShareApplicationModalAction() {
  $showShareApplicationModal.set(true);
}