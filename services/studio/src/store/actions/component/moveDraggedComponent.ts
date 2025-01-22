// moveDraggedComponent.ts

import type { ComponentElement } from "$store/component/interface.ts";
import { $components, $componentWithChildren } from "$store/component/store.ts";
import { $pages } from "$store/page.ts";
import type { PageElement } from "$store/handlers/pages/interfaces/interface.ts";
import { $currentApplication } from "$store/apps.ts";
import { getVar } from "$store/context";
import { updatePageAction } from "../page/updatePageAction";
import { updatePageHandler } from "$store/handlers/pages/handler";
import { updateComponentHandler } from "$store/handlers/components/update-component.handler";

/**
 * Moves a component from its old location (root-level or child of another component)
 * to a new location specified by `dropInComponentId`.
 *
 * Supports:
 * - Container → Root (and vice versa)
 * - Container → Container
 * - Root → Root (re-order at page-level)
 *
 * This version attempts to preserve the dragged component's *old* index
 * in its old parent container when moving to a new container (or root).
 * If that's not desired, you can remove or adjust the "oldIndexInParent"
 * logic to always insert at the end or another index.
 *
 * @param dropInComponentId The component ID where the user is dropping
 * @param draggedComponentId The component ID being dragged
 * @param moveInsideDropIn If true, always move the dragged component *inside* the dropInComponent
 *                         (when dropIn is a container), rather than inserting it as a sibling.
 */
export function moveDraggedComponent(
  dropInComponentId: string,
  draggedComponentId: string,
  moveInsideDropIn = false
) {
  const appUUID = $currentApplication.get().uuid;
  const components: ComponentElement[] = $componentWithChildren(appUUID).get();

  // 1) Find the dragged component and note its old parent & index
  let draggedComponent: ComponentElement | undefined;
  let parentOfDragged: ComponentElement | undefined;
  let oldIndexInParent = -1; // used to preserve ordering if we move from container->container or container->root

  // Recursively locate the dragged component
  function findDraggedRecursively(comp: ComponentElement) {
    if (comp.uuid === draggedComponentId) {
      draggedComponent = comp;
      return;
    }
    if (comp.childrenIds) {
      for (const childId of comp.childrenIds) {
        const child = components.find((c) => c.uuid === childId);
        if (child) {
          findDraggedRecursively(child);
          if (draggedComponent) return; // stop when found
        }
      }
    }
  }

  // Identify the parent that may have draggedComponentId in its children
  parentOfDragged = components.find((c) =>
    c.childrenIds?.includes(draggedComponentId)
  );

  // If we didn't find that parent, the dragged component might be root-level.
  // We still need to locate the actual dragged component object.
  for (const rootComp of components) {
    findDraggedRecursively(rootComp);
    if (draggedComponent) break;
  }

  // Quick bail-out: no dragged component or dropping onto itself
  if (!draggedComponent || draggedComponent.uuid === dropInComponentId) {
    return;
  }

  // Ensure dragged component is in the components array
  if (!components.some((c) => c.uuid === draggedComponentId)) {
    components.push(draggedComponent);
  }

  // 2) Get the current page info
  const currentPageId = getVar("global", "currentPage").value;
  const pagesForApp = $pages.get()[appUUID];
  const pageIndex = pagesForApp.findIndex(
    (page: PageElement) => page.uuid === currentPageId
  );
  if (pageIndex < 0) return;
  const page = pagesForApp[pageIndex];

  // 3) Remove the dragged component from its old location
  if (parentOfDragged) {
    // If the old parent is an actual component (container)
    oldIndexInParent = parentOfDragged.childrenIds?.indexOf(draggedComponentId) ?? -1;
    parentOfDragged.childrenIds = parentOfDragged.childrenIds?.filter(
      (id) => id !== draggedComponentId
    );
    // Update old parent in the store to reflect removal
    updateComponentHandler(parentOfDragged, appUUID);
  } else {
    // Otherwise, remove it from the page root array
    oldIndexInParent = page.component_ids.indexOf(draggedComponentId);
    page.component_ids = page.component_ids.filter(
      (id) => id !== draggedComponentId
    );
    if ("root" in draggedComponent) {
      draggedComponent.root = false;
    }
  }

  // 4) Figure out where to insert the dragged component now
  const dropInComponent = components.find((c) => c.uuid === dropInComponentId);

  // 4a) If there's NO valid dropInComponent => dropping onto the page root
  if (!dropInComponent) {
    // Insert at the same "index" as it had in its old container/parent, if possible
    const insertionIndex =
      oldIndexInParent >= 0 && oldIndexInParent <= page.component_ids.length
        ? oldIndexInParent
        : page.component_ids.length; // fallback if oldIndex is invalid

    page.component_ids.splice(insertionIndex, 0, draggedComponentId);
    draggedComponent.root = true;

  } else {
    // 4b) We found a drop target
    const dropInIsContainer = Array.isArray(dropInComponent.childrenIds);

    // If we want to forcibly move inside the dropIn (and it's a container)
    // then just insert as a child of dropIn, skipping sibling logic.
    if (moveInsideDropIn && dropInIsContainer) {
      dropInComponent.childrenIds = dropInComponent.childrenIds || [];
      const insertionIndex =
        oldIndexInParent >= 0 && oldIndexInParent <= dropInComponent.childrenIds.length
          ? oldIndexInParent
          : dropInComponent.childrenIds.length;

      dropInComponent.childrenIds.splice(insertionIndex, 0, draggedComponentId);
      updateComponentHandler(dropInComponent, appUUID);
    } else {
      // Otherwise, use the normal logic:
      //   1) If dropIn has its own parent => insert as sibling before dropIn
      //   2) If dropIn is container (and we didn't force inside) => add as child
      //   3) If dropIn is not a container => reorder at page level

      const parentOfDropIn = components.find((c) =>
        c.childrenIds?.includes(dropInComponentId)
      );

      if (parentOfDropIn) {
        // Insert dragged as a sibling before dropIn inside parentOfDropIn.childrenIds
        const indexOfDropIn = parentOfDropIn.childrenIds?.indexOf(dropInComponentId);
        if (indexOfDropIn != null && indexOfDropIn >= 0) {
          parentOfDropIn.childrenIds?.splice(indexOfDropIn, 0, draggedComponentId);
        } else {
          // Fallback
          parentOfDropIn.childrenIds?.push(draggedComponentId);
        }
        updateComponentHandler(parentOfDropIn, appUUID);

      } else if (dropInIsContainer) {
        // dropIn is itself a container (root-level or no parent),
        // but we're not forcing inside – or simply continuing standard logic.
        dropInComponent.childrenIds = dropInComponent.childrenIds || [];

        const insertionIndex =
          oldIndexInParent >= 0 && oldIndexInParent <= dropInComponent.childrenIds.length
            ? oldIndexInParent
            : dropInComponent.childrenIds.length;

        dropInComponent.childrenIds.splice(insertionIndex, 0, draggedComponentId);

        updateComponentHandler(dropInComponent, appUUID);

      } else {
        // dropIn is not a container, is root-level => insert at page level
        const dropInIndex = page.component_ids.indexOf(dropInComponentId);
        if (dropInIndex >= 0) {
          // Insert dragged BEFORE dropIn in the page
          page.component_ids.splice(dropInIndex, 0, draggedComponentId);
        } else {
          // If dropIn wasn't found in the page root array, fallback:
          const insertionIndex =
            oldIndexInParent >= 0 && oldIndexInParent <= page.component_ids.length
              ? oldIndexInParent
              : page.component_ids.length;

          page.component_ids.splice(insertionIndex, 0, draggedComponentId);
        }
      }
    }
  }

  // 5) Update the dragged component in all cases
  updateComponentHandler(draggedComponent, appUUID);

  // 6) Finally, update store & page
  $components.setKey(appUUID, components);
  updatePageAction(page, appUUID);
  updatePageHandler(page);

  console.log(
    `[moveDraggedComponent] Moved ${draggedComponent.uuid} to new container or root.`
  );
}