import { $showBorder } from "$store/page.ts";

export function setShowBorder(showBorder: boolean) {
  $showBorder.set(showBorder);
}