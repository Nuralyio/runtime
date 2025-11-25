import { $toasts, type Toast } from '../../shared/redux/store/toast';
import { eventDispatcher } from '../../shared/utils/change-detection';
import { v4 as uuidv4 } from 'uuid';

/**
 * Shows a toast notification
 * @param options - Toast options
 * @returns Toast ID for programmatic control
 */
export function showToast(options: {
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  closable?: boolean;
}): string {
  const id = `toast-${uuidv4()}`;
  const toast: Toast = {
    id,
    type: 'info',
    duration: 3000,
    closable: true,
    ...options
  };

  const current = $toasts.get();
  $toasts.setKey('toasts', [...current.toasts, toast]);

  // Emit event for EventDispatcher subscribers
  eventDispatcher.emit('toast:show', toast);

  // Auto-remove after duration (if duration > 0)
  if (toast.duration && toast.duration > 0) {
    setTimeout(() => hideToast(id), toast.duration);
  }

  return id;
}

/**
 * Hides a specific toast by ID
 * @param id - Toast ID to hide
 */
export function hideToast(id: string): void {
  const current = $toasts.get();
  $toasts.setKey('toasts', current.toasts.filter(t => t.id !== id));
  eventDispatcher.emit('toast:hide', { id });
}

/**
 * Clears all active toasts
 */
export function clearAllToasts(): void {
  $toasts.setKey('toasts', []);
  eventDispatcher.emit('toast:clear');
}

/**
 * Shows a success toast (convenience function)
 * @param message - Success message
 * @param duration - Display duration in milliseconds (default: 3000)
 */
export function showSuccess(message: string, duration = 3000): string {
  return showToast({ message, type: 'success', duration });
}

/**
 * Shows an error toast (convenience function)
 * @param message - Error message
 * @param duration - Display duration in milliseconds (default: 5000)
 */
export function showError(message: string, duration = 5000): string {
  return showToast({ message, type: 'error', duration });
}

/**
 * Shows a warning toast (convenience function)
 * @param message - Warning message
 * @param duration - Display duration in milliseconds (default: 4000)
 */
export function showWarning(message: string, duration = 4000): string {
  return showToast({ message, type: 'warning', duration });
}

/**
 * Shows an info toast (convenience function)
 * @param message - Info message
 * @param duration - Display duration in milliseconds (default: 3000)
 */
export function showInfo(message: string, duration = 3000): string {
  return showToast({ message, type: 'info', duration });
}
