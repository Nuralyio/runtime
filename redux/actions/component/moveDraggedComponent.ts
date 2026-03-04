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

type Position = "before" | "after" | "inside";

function findComponentRecursively(
  targetId: string,
  comp: ComponentElement,
  components: ComponentElement[]
): ComponentElement | undefined {
  if (comp.uuid === targetId) return { ...comp };
  if (!comp.children_ids) return undefined;
  for (const childId of comp.children_ids) {
    const child = components.find((c) => c.uuid === childId);
    if (!child) continue;
    const found = findComponentRecursively(targetId, child, components);
    if (found) return found;
  }
  return undefined;
}

function clampedIndex(preferredIndex: number, length: number): number {
  return preferredIndex >= 0 && preferredIndex <= length ? preferredIndex : length;
}

function computeInsertIndex(anchorIndex: number, position: Position): number {
  if (position === "after") return anchorIndex + 1;
  return Math.max(0, anchorIndex);
}

function removeDraggedFromParent(
  parentOfDragged: ComponentElement | undefined,
  draggedComponentId: string,
  draggedComponent: ComponentElement,
  page: PageElement,
  appUUID: string
): number {
  if (parentOfDragged) {
    const idx = parentOfDragged.children_ids?.indexOf(draggedComponentId) ?? -1;
    parentOfDragged.children_ids = parentOfDragged.children_ids?.filter(id => id !== draggedComponentId);
    updateComponentHandler(parentOfDragged, appUUID);
    return idx;
  }
  const idx = page.component_ids.indexOf(draggedComponentId);
  page.component_ids = page.component_ids.filter(id => id !== draggedComponentId);
  if ("root" in draggedComponent) {
    draggedComponent.root = false;
  }
  return idx;
}

function insertInsideContainer(
  dropInComponent: ComponentElement,
  draggedComponentId: string,
  oldIndexInParent: number,
  appUUID: string
): void {
  dropInComponent.children_ids = dropInComponent.children_ids || [];
  const idx = clampedIndex(oldIndexInParent, dropInComponent.children_ids.length);
  dropInComponent.children_ids.splice(idx, 0, draggedComponentId);
  updateComponentHandler(dropInComponent, appUUID);
}

function insertAdjacentInParent(
  parentOfDropIn: ComponentElement,
  dropInComponentId: string,
  draggedComponentId: string,
  position: Position,
  appUUID: string
): void {
  const anchorIndex = parentOfDropIn.children_ids?.indexOf(dropInComponentId) ?? -1;
  if (anchorIndex >= 0) {
    const idx = computeInsertIndex(anchorIndex, position);
    parentOfDropIn.children_ids?.splice(idx, 0, draggedComponentId);
  } else {
    parentOfDropIn.children_ids?.push(draggedComponentId);
  }
  updateComponentHandler(parentOfDropIn, appUUID);
}

function insertAdjacentAtRoot(
  page: PageElement,
  dropInComponentId: string,
  draggedComponentId: string,
  position: Position,
  oldIndexInParent: number
): void {
  const dropInIndex = page.component_ids.indexOf(dropInComponentId);
  if (dropInIndex >= 0) {
    const idx = computeInsertIndex(dropInIndex, position);
    page.component_ids.splice(idx, 0, draggedComponentId);
  } else {
    const idx = clampedIndex(oldIndexInParent, page.component_ids.length);
    page.component_ids.splice(idx, 0, draggedComponentId);
  }
}

interface DropTargetContext {
  dropInComponent: ComponentElement | undefined;
  components: ComponentElement[];
  draggedComponent: ComponentElement;
  draggedComponentId: string;
  dropInComponentId: string;
  position: Position;
  oldIndexInParent: number;
  page: PageElement;
  appUUID: string;
}

function insertAtDropTarget(ctx: DropTargetContext): void {
  const { dropInComponent, components, draggedComponent, draggedComponentId, dropInComponentId, position, oldIndexInParent, page, appUUID } = ctx;

  if (!dropInComponent) {
    const idx = clampedIndex(oldIndexInParent, page.component_ids.length);
    page.component_ids.splice(idx, 0, draggedComponentId);
    draggedComponent.root = true;
    return;
  }

  if (position === "inside" && Array.isArray(dropInComponent.children_ids)) {
    insertInsideContainer(dropInComponent, draggedComponentId, oldIndexInParent, appUUID);
    return;
  }

  const parentOfDropIn = components.find((c) => c.children_ids?.includes(dropInComponentId));
  if (parentOfDropIn) {
    insertAdjacentInParent(parentOfDropIn, dropInComponentId, draggedComponentId, position, appUUID);
  } else {
    draggedComponent.root = true;
    insertAdjacentAtRoot(page, dropInComponentId, draggedComponentId, position, oldIndexInParent);
  }
}

function findDraggedComponent(
  draggedComponentId: string,
  components: ComponentElement[]
): ComponentElement | undefined {
  for (const rootComp of components) {
    const found = findComponentRecursively(draggedComponentId, rootComp, components);
    if (found) return found;
  }
  return undefined;
}

function getCurrentPageFromStore(appUUID: string, currentPageId: string): PageElement | undefined {
  const pagesForApp = $pages.get()[appUUID];
  const pageIndex = pagesForApp.findIndex((page: PageElement) => page.uuid === currentPageId);
  return pageIndex >= 0 ? pagesForApp[pageIndex] : undefined;
}

function validateAndPrepareMove(
  draggedComponent: ComponentElement | undefined,
  draggedComponentId: string,
  dropInComponentId: string,
  components: ComponentElement[]
): boolean {
  if (!draggedComponent || draggedComponent.uuid === dropInComponentId) return false;
  if (!components.some((c) => c.uuid === draggedComponentId)) {
    components.push({ ...draggedComponent });
  }
  return true;
}

function finalizeComponentMove(
  draggedComponent: ComponentElement,
  components: ComponentElement[],
  page: PageElement,
  appUUID: string
): void {
  updateComponentHandler(draggedComponent, appUUID);
  $components.setKey(appUUID, components);
  updatePageAction(page, appUUID);
  updatePageHandler(page);
  eventDispatcher.emit("component:refresh");
}

export function moveDraggedComponent(
  dropInComponentId: string,
  draggedComponentId: string,
  position: Position = "inside"
) {
  const appUUID = $currentApplication.get().uuid;
  const components: ComponentElement[] = $componentWithChildren(appUUID).get();

  const draggedComponent = findDraggedComponent(draggedComponentId, components);

  if (!validateAndPrepareMove(draggedComponent, draggedComponentId, dropInComponentId, components)) {
    return;
  }

  const currentPageId = ExecuteInstance.Vars.currentPage;
  const page = getCurrentPageFromStore(appUUID, currentPageId);
  if (!page) return;

  const parentOfDragged = components.find((c) => c.children_ids?.includes(draggedComponentId));
  const oldIndexInParent = removeDraggedFromParent(parentOfDragged, draggedComponentId, draggedComponent, page, appUUID);

  const dropInComponent = components.find((c) => c.uuid === dropInComponentId);
  insertAtDropTarget({ dropInComponent, components, draggedComponent, draggedComponentId, dropInComponentId, position, oldIndexInParent, page, appUUID });

  finalizeComponentMove(draggedComponent, components, page, appUUID);
}
