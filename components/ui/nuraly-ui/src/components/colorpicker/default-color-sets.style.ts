import { css } from 'lit';

/**
 * Default Color Sets component styles
 * Using shared CSS variables from /src/shared/themes/
 */
const defaultColorSetsStyle = css`
  .default-color-sets-container {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
  }
  
  .default-color-sets-container * {
    margin: var(--nuraly-spacing-1, 0.25rem);
  }
  
  .color-set-container {
    cursor: pointer;
    position: relative;
    transition: all var(--nuraly-transition-base, 0.2s) ease-in-out;
  }
  
  .color-set-container:hover {
    box-shadow: 0 0 0 2px var(--nuraly-color-focus, rgba(15, 98, 254, 0.5));
    opacity: var(--nuraly-opacity-hover, 0.9);
  }
  
  .color-set-container:active {
    box-shadow: 0 0 0 2px var(--nuraly-color-focus-active, rgba(15, 98, 254, 0.8));
    opacity: 1;
  }
`;

export const styles = defaultColorSetsStyle;
