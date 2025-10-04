import { $pageSize } from "@shared/redux/store/page";

export function updatePageInfo(pageInfo: any) {
  $pageSize.set(pageInfo);
}