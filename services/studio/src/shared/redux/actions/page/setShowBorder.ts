import { $showBorder } from "@shared/redux/store/page";

export function setShowBorder(showBorder: boolean) {
  $showBorder.set(showBorder);
}