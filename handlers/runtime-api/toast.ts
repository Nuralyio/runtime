import { showToast, hideToast, clearAllToasts } from '../../utils/toast';

/**
 * Creates toast notification functions for the runtime API
 * These functions are available globally in all handler code (studio + micro-apps)
 */
export function createToastFunctions() {
  return {
    /**
     * Shows a toast notification
     * @param message - The message to display
     * @param type - Toast type: 'success', 'error', 'warning', 'info' (default: 'info')
     * @param options - Additional options (duration, closable)
     * @returns Toast ID for programmatic control
     *
     * @example
     * ShowToast('File saved successfully!', 'success');
     * ShowToast('Error occurred', 'error', { duration: 5000 });
     * ShowToast('Processing...', 'info', { duration: 0 }); // No auto-hide
     */
    ShowToast: (
      message: string,
      type: 'success' | 'error' | 'warning' | 'info' = 'info',
      options?: { duration?: number; closable?: boolean }
    ): string => {
      return showToast({
        message,
        type,
        ...options
      });
    },

    /**
     * Shows a success toast (convenience function)
     * @param message - Success message
     * @param duration - Display duration in milliseconds (default: 3000)
     * @returns Toast ID
     *
     * @example
     * ShowSuccessToast('Operation completed!');
     */
    ShowSuccessToast: (message: string, duration = 3000): string => {
      return showToast({ message, type: 'success', duration });
    },

    /**
     * Shows an error toast (convenience function)
     * @param message - Error message
     * @param duration - Display duration in milliseconds (default: 5000)
     * @returns Toast ID
     *
     * @example
     * ShowErrorToast('Failed to save file');
     */
    ShowErrorToast: (message: string, duration = 5000): string => {
      return showToast({ message, type: 'error', duration });
    },

    /**
     * Shows a warning toast (convenience function)
     * @param message - Warning message
     * @param duration - Display duration in milliseconds (default: 4000)
     * @returns Toast ID
     *
     * @example
     * ShowWarningToast('This action cannot be undone');
     */
    ShowWarningToast: (message: string, duration = 4000): string => {
      return showToast({ message, type: 'warning', duration });
    },

    /**
     * Shows an info toast (convenience function)
     * @param message - Info message
     * @param duration - Display duration in milliseconds (default: 3000)
     * @returns Toast ID
     *
     * @example
     * ShowInfoToast('Loading data...');
     */
    ShowInfoToast: (message: string, duration = 3000): string => {
      return showToast({ message, type: 'info', duration });
    },

    /**
     * Hides a specific toast by ID
     * @param id - Toast ID returned from ShowToast
     *
     * @example
     * const toastId = ShowToast('Processing...', 'info', { duration: 0 });
     * // ... later
     * HideToast(toastId);
     */
    HideToast: (id: string): void => {
      hideToast(id);
    },

    /**
     * Clears all active toasts
     *
     * @example
     * ClearAllToasts();
     */
    ClearAllToasts: (): void => {
      clearAllToasts();
    }
  };
}
