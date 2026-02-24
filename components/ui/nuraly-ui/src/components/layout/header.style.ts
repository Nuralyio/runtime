import { css } from 'lit';

export const headerStyles = css`
  :host {
    display: block;
  }

  .nr-header {
    display: flex;
    align-items: center;
    padding: var(--nuraly-layout-header-padding);
    height: var(--nuraly-layout-header-height);
    line-height: var(--nuraly-layout-header-height);
    background: var(--nuraly-layout-header-background);
    color: var(--nuraly-layout-header-text);
    border-bottom: 1px solid var(--nuraly-layout-header-border);
    transition: var(--nuraly-layout-transition);
  }
`;
