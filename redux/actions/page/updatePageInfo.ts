import { $pageSize } from '../../store/page';

export function updatePageInfo(pageInfo: any) {
  $pageSize.set(pageInfo);
}