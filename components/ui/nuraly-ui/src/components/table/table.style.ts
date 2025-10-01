import { css } from 'lit';

export default css`
  :host {
    display: block;
    width: 100%;
    font-family: var(--nuraly-font-family, Arial, sans-serif);
    color: var(--nuraly-color-text);
    background-color: var(--nuraly-color-background);
  }

  .filter-container {
    display: flex;
    justify-content: flex-end;
    width: 100%;
    padding: var(--nuraly-spacing-2, 0.5rem) 0;
  }
`;
