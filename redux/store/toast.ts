import { deepMap } from 'nanostores';

/**
 * Toast notification interface
 */
export interface Toast {
  id: string;
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  closable?: boolean;
}

/**
 * Toast store interface
 */
export interface ToastStore {
  toasts: Toast[];
}

/**
 * Global toast store - accessible everywhere in studio and micro-apps
 */
export const $toasts = deepMap<ToastStore>({
  toasts: []
});
