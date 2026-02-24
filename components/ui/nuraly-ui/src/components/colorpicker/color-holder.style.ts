import { css } from 'lit';

/**
 * Color Holder component styles
 * Using shared CSS variables from /src/shared/themes/
 */
const colorHolderStyles = css`
  :host {
    display: inline-block;
    cursor: pointer;
    
    /* Ensure clean state transitions */
    * {
      transition: all var(--nuraly-transition-fast, 0.15s) ease;
    }
  }

  .color-holder-container {
    width: var(--nuraly-size-colorpicker-default, 30px);
    height: var(--nuraly-size-colorpicker-default-height, 25px);
    border: 1px solid var(--nuraly-color-border, rgba(0, 0, 0, 0.2));
    box-sizing: border-box;
    border-radius: var(--nuraly-border-radius-small, 2px);
  }
  
  :host([size='small']) .color-holder-container {
    width: var(--nuraly-size-colorpicker-small, 20px);
    height: var(--nuraly-size-colorpicker-small-height, 15px);
  }
  
  :host([size='large']) .color-holder-container {
    width: var(--nuraly-size-colorpicker-large, 35px);
    height: var(--nuraly-size-colorpicker-large-height, 30px);
  }
  
  .color-holder-container--disabled {
    opacity: var(--nuraly-opacity-disabled, 0.5);
    cursor: not-allowed;
  }
  
  :host(:hover:not([disabled])) .color-holder-container {
    border-color: var(--nuraly-color-border-hover, rgba(0, 0, 0, 0.4));
  }
`;

export const styles = colorHolderStyles;
