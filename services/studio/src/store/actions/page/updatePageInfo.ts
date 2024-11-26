import { $pageSize } from "$store/page.ts";

export function updatePageInfo(pageInfo: any) {
  $pageSize.set(pageInfo);
}