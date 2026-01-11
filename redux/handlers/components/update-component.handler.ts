import { FRONT_API_URLS } from '../api-urls';
import { validateAndEmitErrors } from "./validation-handler";
import { eventDispatcher } from '../../../../runtime/utils/change-detection.ts';
import { showError } from '../../../../runtime/utils/toast';
import { $components } from '../../store/component/store';
import { ExecuteInstance } from '../../../../runtime/state/runtime-context';

export const updateComponentHandler = (component: any, application_id: string) => {
  // Validate handlers before saving
  const validationError = validateAndEmitErrors(component);
  if (validationError instanceof Promise) return validationError;

  const ucomponent = { ...component };
  delete ucomponent.parent
  delete ucomponent.children
  delete ucomponent.children
  fetch(`${FRONT_API_URLS.COMPONENTS}/${ucomponent.uuid}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      component: { ...ucomponent, application_id }
    })
  }).then(async (res) => {
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        const errorMessage = data.error || `Failed to save component (${res.status})`;

        // Show toast for permission errors
        if (res.status === 403) {
          showError(errorMessage);
        } else {
          showError(errorMessage);
        }

        // Dispatch error event
        eventDispatcher.emit("component:save-error", {
          componentId: component.uuid,
          error: errorMessage
        });
        return;
      }

      // Update component in store with fresh data
      const componentsStore = $components.get();
      const appComponents = componentsStore[application_id] || [];
      const componentIndex = appComponents.findIndex(c => c.uuid === component.uuid);
      if (componentIndex !== -1) {
        const updatedComponents = [...appComponents];
        updatedComponents[componentIndex] = component;
        $components.setKey(application_id, updatedComponents);
      }

      // Update selectedComponents with fresh reference
      const selectedComponents = ExecuteInstance?.Vars?.selectedComponents;
      if (selectedComponents && Array.isArray(selectedComponents)) {
        const selectedIndex = selectedComponents.findIndex((c: any) => c?.uuid === component.uuid);
        if (selectedIndex !== -1) {
          const newSelected = [...selectedComponents];
          newSelected[selectedIndex] = component;
          ExecuteInstance.VarsProxy.selectedComponents = newSelected;
        }
      }

      // Emit success event for change detection
      eventDispatcher.emit('component:updated', {
        uuid: component.uuid
      });

      return res.json();
    })
    .catch((err) => {
      // Dispatch error
      const errorMessage = err.message || "Failed to save component";
      showError(errorMessage);

      eventDispatcher.emit("component:save-error", {
        componentId: component.uuid,
        error: errorMessage
      });

      console.error(err);
    });
};
