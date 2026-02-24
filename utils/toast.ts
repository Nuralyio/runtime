import { $toasts, type Toast } from '../redux/store/toast';
import { eventDispatcher } from './change-detection';
import { ToastContainer } from '../components/ui/components/ToastContainer/ToastContainer';

let toastIdCounter = 0;

function generateToastId(): string {
  return `toast-${Date.now()}-${++toastIdCounter}`;
}

// Initialize ToastContainer singleton on first use
let initialized = false;
function ensureToastContainer() {
  if (!initialized && typeof window !== 'undefined') {
    initialized = true;
    setTimeout(() => {
      ToastContainer.getInstance();
    }, 0);
  }
}

/**
 * Shows a toast notification
 */
export function showToast(options: {
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  closable?: boolean;
}): string {
  ensureToastContainer();

  const id = generateToastId();
  const toast: Toast = {
    id,
    type: 'info',
    duration: 3000,
    closable: true,
    ...options
  };

  const current = $toasts.get();
  ($toasts as any).setKey('toasts', [...current.toasts, toast]);

  eventDispatcher.emit('toast:show', toast);

  if (toast.duration && toast.duration > 0) {
    setTimeout(() => hideToast(id), toast.duration);
  }

  return id;
}

/**
 * Hides a specific toast by ID
 */
export function hideToast(id: string): void {
  const current = $toasts.get();
  ($toasts as any).setKey('toasts', current.toasts.filter(t => t.id !== id));
  eventDispatcher.emit('toast:hide', { id });
}

/**
 * Clears all active toasts
 */
export function clearAllToasts(): void {
  ($toasts as any).setKey('toasts', []);
  eventDispatcher.emit('toast:clear');
}

/**
 * Shows a success toast
 */
export function showSuccess(message: string, duration = 3000): string {
  return showToast({ message, type: 'success', duration });
}

/**
 * Shows an error toast
 */
export function showError(message: string, duration = 5000): string {
  return showToast({ message, type: 'error', duration });
}

/**
 * Shows a warning toast
 */
export function showWarning(message: string, duration = 4000): string {
  return showToast({ message, type: 'warning', duration });
}

/**
 * Shows an info toast
 */
export function showInfo(message: string, duration = 3000): string {
  return showToast({ message, type: 'info', duration });
}
