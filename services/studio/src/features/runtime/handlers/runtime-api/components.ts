/**
 * Component Management Functions
 * 
 * CRUD operations for components.
 */

import Editor from '../../state/editor';
import { addComponentAction, deleteComponentAction } from '../../redux/actions/component';
import { copyCpmponentToClipboard, pasteComponentFromClipboard } from '../../utils/clipboard-utils';
import { GenerateName } from '../../utils/naming-generator';
import type { ComponentElement } from '../../redux/store/component';

export function createComponentFunctions(runtimeContext: any) {
  const { applications } = runtimeContext;

  return {
    /**
     * Gets a component by UUID
     */
    GetComponent: (componentUuid: string, application_id: string): any => {
      return Editor.components.find((c: ComponentElement) => c.uuid === componentUuid);
    },

    /**
     * Gets multiple components by their IDs
     */
    GetComponents: (componentIds: string[]): any[] => {
      return Object.values(applications).flat().filter((c: any) => componentIds.includes(c.uuid));
    },

    /**
     * Adds a new component to the page
     */
    AddComponent: ({ application_id, pageId, componentType, additionalData }): any => {
      const generatedName = GenerateName(componentType);
      addComponentAction({ name: generatedName, component_type: componentType, ...additionalData }, pageId, application_id);
    },

    /**
     * Deletes a component with confirmation
     */
    DeleteComponentAction: (component: ComponentElement) => {
      const userInput = confirm("Are you sure you want to delete this component?");
      if (userInput) {
        deleteComponentAction(component.uuid, component.application_id);
      }
    },

    /**
     * Copies component to clipboard
     */
    CopyComponentToClipboard: (component: ComponentElement) => {
      copyCpmponentToClipboard(component);
    },

    /**
     * Pastes component from clipboard
     */
    PasteComponentFromClipboard: () => {
      pasteComponentFromClipboard();
    },
  };
}
