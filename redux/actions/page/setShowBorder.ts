import { $showBorder } from '../../store/page';

export function setShowBorder(showBorder: boolean) {
  $showBorder.set(showBorder);
}