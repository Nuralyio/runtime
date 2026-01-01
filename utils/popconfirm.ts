import { PopconfirmContainer } from '../components/ui/components/PopconfirmContainer/PopconfirmContainer';
import type { PopconfirmShowConfig, PopconfirmPosition } from '../components/ui/nuraly-ui/src/components/popconfirm/popconfirm.types';

/**
 * Shows a popconfirm at a specific position
 * @param config - Popconfirm configuration
 * @param position - Position to show the popconfirm (x, y coordinates)
 * @returns Popconfirm ID for programmatic control
 */
export function showPopconfirm(
  config: PopconfirmShowConfig,
  position: PopconfirmPosition
): string | null {
  console.log('[utils/popconfirm] showPopconfirm called with:', { config, position });
  const result = PopconfirmContainer.show(config, position);
  console.log('[utils/popconfirm] showPopconfirm result:', result);
  return result;
}

/**
 * Shows a confirmation dialog and returns a promise
 * @param config - Popconfirm configuration
 * @param position - Position to show the popconfirm (x, y coordinates)
 * @returns Promise that resolves to true if confirmed, false if cancelled
 */
export async function confirm(
  config: PopconfirmShowConfig,
  position: PopconfirmPosition
): Promise<boolean> {
  return PopconfirmContainer.confirm(config, position);
}

/**
 * Closes a specific popconfirm by ID
 * @param id - Popconfirm ID
 */
export function closePopconfirm(id: string): void {
  PopconfirmContainer.close(id);
}

/**
 * Closes all open popconfirms
 */
export function closeAllPopconfirms(): void {
  PopconfirmContainer.closeAll();
}
