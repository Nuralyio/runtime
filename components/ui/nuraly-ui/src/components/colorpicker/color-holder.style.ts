import {css} from 'lit';

const colorHolderStyles = css`
  :host {
    cursor: pointer;
  }
  .color-holder-container {
    border: var(--hybrid-colorpicker-border-color);
  }

  .color-holder-container {
    width: var(--hybrid-colorpicker-default-width);
    height: var(--hybrid-colorpicker-default-height);
  }
  :host([size='small']) .color-holder-container {
    width: var(--hybrid-colorpicker-small-width);
    height: var(--hybrid-colorpicker-small-height);
  }
  :host([size='large']) .color-holder-container {
    width: var(--hybrid-colorpicker-large-width);
    height: var(--hybrid-colorpicker-large-height);
  }
`;

export const styles = colorHolderStyles;
