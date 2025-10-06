import { css } from 'lit';

export const footerStyles = css`
  :host {
    display: block;
  }

  .nr-footer {
    padding: var(--nuraly-layout-footer-padding);
    background: var(--nuraly-layout-footer-background);
    color: var(--nuraly-layout-footer-text);
    border-top: 1px solid var(--nuraly-layout-footer-border);
    font-size: var(--nuraly-layout-font-size);
    line-height: var(--nuraly-layout-line-height);
    transition: var(--nuraly-layout-transition);
  }
`;
