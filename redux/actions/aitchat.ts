import type { ComponentElement } from '../store/component/component.interface';
import { getVar } from '../store/context';
import { eventDispatcher } from '../../utils/change-detection';

import { addComponentAction } from './component/addComponentAction';

export function addGeneratedComponents(structureComponent: ComponentElement[]) {

  structureComponent.forEach((component: any) => {
    addComponentAction(component,
      getVar("global", "currentPage").value,
      getVar("global", "currentEditingApplication").value.uuid);
  });
  setTimeout(() => {
    eventDispatcher.emit("component:refresh");
  }, 1000);
}