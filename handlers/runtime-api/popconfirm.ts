import { showPopconfirm, confirm, closePopconfirm, closeAllPopconfirms } from '../../utils/popconfirm';
import type { PopconfirmShowConfig, PopconfirmPosition } from '../../components/ui/nuraly-ui/src/components/popconfirm/popconfirm.types';

/**
 * Creates popconfirm functions for the runtime API
 * These functions are available globally in all handler code (studio + micro-apps)
 */
export function createPopconfirmFunctions() {
  return {
    /**
     * Shows a confirmation popconfirm at a specified position
     * @param config - Configuration object with title, description, callbacks, etc.
     * @param position - Position {x, y} where to show the popconfirm (e.g., mouse position)
     * @returns Popconfirm ID for programmatic control, or null if failed
     *
     * @example
     * // Show at current mouse position from event
     * ShowPopconfirm({
     *   title: 'Delete item?',
     *   description: 'This action cannot be undone.',
     *   okType: 'danger',
     *   onConfirm: () => { console.log('Deleted!'); },
     *   onCancel: () => { console.log('Cancelled'); }
     * }, { x: EventData.clientX, y: EventData.clientY });
     */
    ShowPopconfirm: (
      config: PopconfirmShowConfig,
      position: PopconfirmPosition
    ): string | null => {
      return showPopconfirm(config, position);
    },

    /**
     * Shows a confirmation dialog and waits for user response
     * @param config - Configuration object with title, description, etc.
     * @param position - Position {x, y} where to show the popconfirm
     * @returns Promise that resolves to true if confirmed, false if cancelled
     *
     * @example
     * // Async confirmation
     * const confirmed = await Confirm({
     *   title: 'Are you sure?',
     *   description: 'This will delete the item permanently.',
     *   okText: 'Delete',
     *   okType: 'danger'
     * }, { x: EventData.clientX, y: EventData.clientY });
     *
     * if (confirmed) {
     *   // User clicked OK
     *   await deleteItem();
     * }
     */
    Confirm: async (
      config: PopconfirmShowConfig,
      position: PopconfirmPosition
    ): Promise<boolean> => {
      return confirm(config, position);
    },

    /**
     * Shows a delete confirmation popconfirm (convenience function)
     * @param itemName - Name of the item being deleted
     * @param position - Position {x, y} where to show the popconfirm
     * @param onConfirm - Callback when user confirms deletion
     * @param onCancel - Optional callback when user cancels
     * @returns Popconfirm ID
     *
     * @example
     * ShowDeleteConfirm('User "John Doe"', { x: e.clientX, y: e.clientY }, async () => {
     *   await deleteUser(userId);
     *   ShowSuccessToast('User deleted successfully');
     * });
     */
    ShowDeleteConfirm: (
      itemName: string,
      position: PopconfirmPosition,
      onConfirm: () => void | Promise<void>,
      onCancel?: () => void
    ): string | null => {
      return showPopconfirm(
        {
          title: `Delete ${itemName}?`,
          description: 'This action cannot be undone.',
          okText: 'Delete',
          okType: 'danger',
          icon: 'exclamation-circle',
          onConfirm,
          onCancel,
        },
        position
      );
    },

    /**
     * Shows a warning confirmation popconfirm (convenience function)
     * @param title - Title of the warning
     * @param description - Description text
     * @param position - Position {x, y} where to show the popconfirm
     * @param onConfirm - Callback when user confirms
     * @param onCancel - Optional callback when user cancels
     * @returns Popconfirm ID
     *
     * @example
     * ShowWarningConfirm(
     *   'Unsaved Changes',
     *   'You have unsaved changes. Do you want to discard them?',
     *   { x: 200, y: 300 },
     *   () => { discardChanges(); }
     * );
     */
    ShowWarningConfirm: (
      title: string,
      description: string,
      position: PopconfirmPosition,
      onConfirm: () => void | Promise<void>,
      onCancel?: () => void
    ): string | null => {
      return showPopconfirm(
        {
          title,
          description,
          okText: 'Proceed',
          icon: 'exclamation-circle',
          onConfirm,
          onCancel,
        },
        position
      );
    },

    /**
     * Closes a specific popconfirm by ID
     * @param id - Popconfirm ID returned from ShowPopconfirm
     *
     * @example
     * const id = ShowPopconfirm({ title: 'Confirm?' }, { x: 100, y: 100 });
     * // ... later
     * ClosePopconfirm(id);
     */
    ClosePopconfirm: (id: string): void => {
      closePopconfirm(id);
    },

    /**
     * Closes all active popconfirms
     *
     * @example
     * CloseAllPopconfirms();
     */
    CloseAllPopconfirms: (): void => {
      closeAllPopconfirms();
    },
  };
}
