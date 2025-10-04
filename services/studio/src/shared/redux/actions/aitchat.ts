import type { ComponentElement } from "@shared/redux/store/component/component.interface";
import { getVar } from "@shared/redux/store/context";
import { eventDispatcher } from "@shared/utils/change-detection";

import { addComponentAction } from "@shared/redux/actions/component/addComponentAction";

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