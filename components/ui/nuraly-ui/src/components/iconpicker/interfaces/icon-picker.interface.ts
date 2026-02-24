/**
 * @license
 * Copyright 2023 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import type { IconPickerIcon } from '../icon-picker.types.js';

export interface IconPickerHost {
  value: string;
  selectedIcon: IconPickerIcon | null;
  handleIconSelect(icon: IconPickerIcon): void;
  requestUpdate(): void;
}
