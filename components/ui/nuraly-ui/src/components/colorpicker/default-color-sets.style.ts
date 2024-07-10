import {css} from 'lit';

const defaultColorSetsStyle = css`
  .default-color-sets-container {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
  }
  .default-color-sets-container * {
    margin: 3px;
  }
`;

export const styles = defaultColorSetsStyle;
