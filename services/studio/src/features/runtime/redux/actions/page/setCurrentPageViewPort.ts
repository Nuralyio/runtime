import { $currentPageViewPort } from '../../store/page';

export function setCurrentPageViewPort(viewPort: string) {
  $currentPageViewPort.set(viewPort);
}