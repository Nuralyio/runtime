/**
 * @license
 * Copyright 2023 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import { KeyboardController } from '../interfaces/focus-controller.interface.js';
import { RadioButtonOption } from '../radio-group.types.js';

/**
 * Controller that manages keyboard navigation for radio groups
 * This controller ACTUALLY handles keyboard events instead of being a fake controller
 */
export class RadioKeyboardController implements KeyboardController {
  private host: any; // RadioElement host
  private boundKeyDownHandler: (event: KeyboardEvent) => void;

  constructor(host: any, private groupController: any) {
    this.host = host;
    this.boundKeyDownHandler = this.handleKeyDown.bind(this);
    host.addController(this);
  }

  hostConnected() {
    this.host.addEventListener('keydown', this.boundKeyDownHandler);
  }

  hostDisconnected() {
    this.host.removeEventListener('keydown', this.boundKeyDownHandler);
  }

  public handleKeyDown(event: KeyboardEvent): void {
    const options = this.host.options;
    if (!options || options.length === 0) return;

    const currentIndex = options.findIndex((option: RadioButtonOption) => 
      this.groupController.isOptionSelected(option)
    );
    
    switch (event.key) {
      case 'ArrowDown':
      case 'ArrowRight':
        event.preventDefault();
        this.selectNextOption(options, currentIndex);
        break;

      case 'ArrowUp':
      case 'ArrowLeft':
        event.preventDefault();
        this.selectPreviousOption(options, currentIndex);
        break;

      case ' ':
      case 'Enter':
        event.preventDefault();
        // If no option is selected, select the first non-disabled option
        if (currentIndex === -1) {
          this.selectFirstEnabledOption(options);
        }
        break;

      case 'Home':
        event.preventDefault();
        this.selectFirstEnabledOption(options);
        break;

      case 'End':
        event.preventDefault();
        this.selectLastEnabledOption(options);
        break;
    }
  }

  private selectNextOption(options: RadioButtonOption[], currentIndex: number): void {
    const startIndex = currentIndex === -1 ? 0 : currentIndex + 1;
    
    for (let i = 0; i < options.length; i++) {
      const index = (startIndex + i) % options.length;
      const option = options[index];
      
      if (!this.groupController.isOptionDisabled(option)) {
        this.groupController.selectOption(option);
        break;
      }
    }
  }

  private selectPreviousOption(options: RadioButtonOption[], currentIndex: number): void {
    const startIndex = currentIndex === -1 ? options.length - 1 : currentIndex - 1;
    
    for (let i = 0; i < options.length; i++) {
      const index = (startIndex - i + options.length) % options.length;
      const option = options[index];
      
      if (!this.groupController.isOptionDisabled(option)) {
        this.groupController.selectOption(option);
        break;
      }
    }
  }

  private selectFirstEnabledOption(options: RadioButtonOption[]): void {
    const firstEnabled = options.find((option: RadioButtonOption) => 
      !this.groupController.isOptionDisabled(option)
    );
    
    if (firstEnabled) {
      this.groupController.selectOption(firstEnabled);
    }
  }

  private selectLastEnabledOption(options: RadioButtonOption[]): void {
    const enabledOptions = options.filter((option: RadioButtonOption) => 
      !this.groupController.isOptionDisabled(option)
    );
    const lastEnabled = enabledOptions[enabledOptions.length - 1];
    
    if (lastEnabled) {
      this.groupController.selectOption(lastEnabled);
    }
  }
}
