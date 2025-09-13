import { css } from 'lit';

const defaultColorSetsStyle = css`
  .default-color-sets-container {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
  }
  .default-color-sets-container * {
    margin: 3px;
  }
  .color-set-container{
    border: var(--nuraly-colorpicker-border-color);
  }
`;

export const styles = defaultColorSetsStyle;
