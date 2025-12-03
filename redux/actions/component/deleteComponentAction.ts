import { $components } from '../../store/component/store.ts';
import type { ComponentElement } from '../../store/component/component.interface.ts';
import { updateComponentHandler } from '../../handlers/components/update-component.handler.ts';
import { deleteComponentActionHandler } from '../../handlers/components/delete-component.handler.ts';
import { eventDispatcher } from "../../../../runtime/utils/change-detection.ts";
import { removeComponentToCurrentPageAction } from '../page/removeComponentToCurrentPageAction.ts';


// todo: remove component from the parent
export async function deleteComponentAction(componentId: string, application_id: string) {
  const components = $components.get()[application_id];

  const componentToDelete = components.find(
    (component: ComponentElement) => component.uuid === componentId
  );
  if (componentToDelete) {
    if (componentToDelete.root) {
      removeComponentToCurrentPageAction(componentId);
    } else {
      // Traverse all components and remove the componentId from their childrenIds arrays
      components.forEach((component) => {
        if (component.childrenIds) {
          const originalChildrenIds = [...component.childrenIds];
          component.childrenIds = component.childrenIds.filter(
            (childId) => childId !== componentId
          );

          // If the componentId was removed, dispatch the handler
          if (originalChildrenIds.length !== component.childrenIds.length) {
            updateComponentHandler(component, application_id);  // Dispatch the handler
          }
        }
      });

      // Save the updated components to the store
      $components.set({
        ...$components.get(),
        [application_id]: components
      });
    }

    // Remove the component from the components store
    $components.set({
      ...$components.get(),
      [application_id]: components.filter(
        (component: ComponentElement) => component.uuid !== componentId
      )
    });
    await deleteComponentActionHandler(componentId);
    eventDispatcher.emit("component:deleted");
  }
}