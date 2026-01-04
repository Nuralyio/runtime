// moveDraggedComponent.ts

import type { ComponentElement } from '../../store/component/component.interface';
import { $components, $componentWithChildren } from '../../store/component/store';
import { $pages } from '../../store/page';
import type { PageElement } from '../../handlers/pages/page.interface';
import { $currentApplication } from '../../store/apps';
import { updatePageAction } from "../page/updatePageAction";
import { updatePageHandler } from '../../handlers/pages/handler';
import { updateComponentHandler } from '../../handlers/components/update-component.handler';
import { eventDispatcher } from '../../../utils/change-detection';
import { ExecuteInstance } from '../../../state/runtime-context';

export function moveDraggedComponent(
  dropInComponentId: string,
  draggedComponentId: string,
  position: "before" | "after" | "inside" = "inside"
) {
  const appUUID = $currentApplication.get().uuid;
  const components: ComponentElement[] = $componentWithChildren(appUUID).get();

  let draggedComponent: ComponentElement | undefined;
  let parentOfDragged: ComponentElement | undefined;
  let oldIndexInParent = -1;

  function findDraggedRecursively(comp: ComponentElement) {
    if (comp.uuid === draggedComponentId) {
      draggedComponent = { ...comp };
      return;
    }
    if (comp.children_ids) {
      for (const childId of comp.children_ids) {
        const child = components.find((c) => c.uuid === childId);
        if (child) {
          findDraggedRecursively(child);
          if (draggedComponent) return;
        }
      }
    }
  }

  parentOfDragged = components.find((c) => c.children_ids?.includes(draggedComponentId));

  for (const rootComp of components) {
    findDraggedRecursively(rootComp);
    if (draggedComponent) break;
  }

  if (!draggedComponent || draggedComponent.uuid === dropInComponentId) {
    return;
  }

  if (!components.some((c) => c.uuid === draggedComponentId)) {
    components.push({ ...draggedComponent });
  }

  const currentPageId = ExecuteInstance.Vars.currentPage;
  const pagesForApp = $pages.get()[appUUID];
  const pageIndex = pagesForApp.findIndex((page: PageElement) => page.uuid === currentPageId);
  if (pageIndex < 0) return;
  const page = pagesForApp[pageIndex];

  if (parentOfDragged) {
    oldIndexInParent = parentOfDragged.children_ids?.indexOf(draggedComponentId) ?? -1;
    parentOfDragged.children_ids = parentOfDragged.children_ids?.filter(id => id !== draggedComponentId);
    updateComponentHandler(parentOfDragged, appUUID);
  } else {
    oldIndexInParent = page.component_ids.indexOf(draggedComponentId);
    page.component_ids = page.component_ids.filter(id => id !== draggedComponentId);
    if ("root" in draggedComponent) {
      draggedComponent.root = false;
    }
  }

  const dropInComponent = components.find((c) => c.uuid === dropInComponentId);

  if (!dropInComponent) {
    const insertionIndex = oldIndexInParent >= 0 && oldIndexInParent <= page.component_ids.length
      ? oldIndexInParent
      : page.component_ids.length;
    page.component_ids.splice(insertionIndex, 0, draggedComponentId);
    draggedComponent.root = true;
  } else {
    const dropInIsContainer = Array.isArray(dropInComponent.children_ids);

    if (position === "inside" && dropInIsContainer) {
      dropInComponent.children_ids = dropInComponent.children_ids || [];
      const insertionIndex = oldIndexInParent >= 0 && oldIndexInParent <= dropInComponent.children_ids.length
        ? oldIndexInParent
        : dropInComponent.children_ids.length;
      dropInComponent.children_ids.splice(insertionIndex, 0, draggedComponentId);
      updateComponentHandler(dropInComponent, appUUID);
    } else {
      const parentOfDropIn = components.find((c) => c.children_ids?.includes(dropInComponentId));
      if (parentOfDropIn) {
        const indexOfDropIn = parentOfDropIn.children_ids?.indexOf(dropInComponentId);
        if (indexOfDropIn != null && indexOfDropIn >= 0) {
          let insertIndex = indexOfDropIn;
          if (position === "after") insertIndex += 1;
          else if (position === "before") insertIndex = Math.max(0, insertIndex);
          parentOfDropIn.children_ids?.splice(insertIndex, 0, draggedComponentId);
        } else {
          parentOfDropIn.children_ids?.push(draggedComponentId);
        }
        updateComponentHandler(parentOfDropIn, appUUID);
      } else {
        draggedComponent.root = true;
        const dropInIndex = page.component_ids.indexOf(dropInComponentId);
        if (dropInIndex >= 0) {
          let insertIndex = dropInIndex;
          if (position === "after") insertIndex += 1;
          else if (position === "before") insertIndex = Math.max(0, insertIndex);
          page.component_ids.splice(insertIndex, 0, draggedComponentId);
        } else {
          const insertionIndex = oldIndexInParent >= 0 && oldIndexInParent <= page.component_ids.length
            ? oldIndexInParent
            : page.component_ids.length;
          page.component_ids.splice(insertionIndex, 0, draggedComponentId);
        }
      }
    }
  }

  updateComponentHandler(draggedComponent, appUUID);
  $components.setKey(appUUID, components);
  updatePageAction(page, appUUID);
  updatePageHandler(page);
  eventDispatcher.emit("component:refresh");
}