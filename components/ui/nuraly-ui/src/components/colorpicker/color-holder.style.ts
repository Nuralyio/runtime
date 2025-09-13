import { css } from 'lit';

const colorHolderStyles = css`
  :host {
    cursor: pointer;
  }

  .color-holder-container {
    width: var(--nuraly-colorpicker-default-width);
    height: var(--nuraly-colorpicker-default-height);
  }
  :host([size='small']) .color-holder-container {
    width: var(--nuraly-colorpicker-small-width);
    height: var(--nuraly-colorpicker-small-height);
  }
  :host([size='large']) .color-holder-container {
    width: var(--nuraly-colorpicker-large-width);
    height: var(--nuraly-colorpicker-large-height);
  }
`;

export const styles = colorHolderStyles;
