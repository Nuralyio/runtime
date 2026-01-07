/**
 * Modal Control Functions
 *
 * Functions for programmatically controlling modal components.
 */

import { updateComponentAttributes } from '../../redux/actions/component';
import type { ComponentElement } from '../../redux/store/component';
import { $showShareApplicationModal } from '../../redux/store/apps';

export function createModalFunctions() {
  return {
    /**
     * Opens a modal component
     * @param component - The modal component to open
     * @example
     * // In event handler:
     * const modal = GetComponent('my-modal');
     * OpenModal(modal);
     */
    OpenModal: (component: ComponentElement) => {
      if (!component?.uuid || !component?.application_id) {
        console.warn('OpenModal: Invalid component provided');
        return;
      }
      updateComponentAttributes(
        component.application_id,
        component.uuid,
        "input",
        { open: { type: "static", value: true } }
      );
    },

    /**
     * Closes a modal component
     * @param component - The modal component to close
     * @example
     * // In event handler:
     * const modal = GetComponent('my-modal');
     * CloseModal(modal);
     */
    CloseModal: (component: ComponentElement) => {
      if (!component?.uuid || !component?.application_id) {
        console.warn('CloseModal: Invalid component provided');
        return;
      }
      updateComponentAttributes(
        component.application_id,
        component.uuid,
        "input",
        { open: { type: "static", value: false } }
      );
    },

    /**
     * Toggles a modal component's open state
     * @param component - The modal component to toggle
     * @example
     * // In event handler:
     * const modal = GetComponent('my-modal');
     * ToggleModal(modal);
     */
    ToggleModal: (component: ComponentElement) => {
      if (!component?.uuid || !component?.application_id) {
        console.warn('ToggleModal: Invalid component provided');
        return;
      }
      const currentOpen = component?.input?.open?.value ?? false;
      updateComponentAttributes(
        component.application_id,
        component.uuid,
        "input",
        { open: { type: "static", value: !currentOpen } }
      );
    },

    /**
     * Opens the Share Application modal
     * @example
     * // In event handler:
     * ShowShareModal();
     */
    ShowShareModal: () => {
      $showShareApplicationModal.set(true);
    },

    /**
     * Closes the Share Application modal
     * @example
     * // In event handler:
     * CloseShareModal();
     */
    CloseShareModal: () => {
      $showShareApplicationModal.set(false);
    },
  };
}
