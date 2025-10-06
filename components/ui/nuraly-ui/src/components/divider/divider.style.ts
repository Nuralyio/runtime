import { css } from "lit";

export default css`
  :host {
    display: block;
    box-sizing: border-box;
  }

  :host([type="vertical"]) {
    display: inline-block;
  }

  .divider {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
    color: var(--nuraly-divider-text-color);
    font-size: var(--nuraly-divider-font-size);
    line-height: 1.5715;
    list-style: none;
    font-family: inherit;
  }

  /* Horizontal Divider */
  .divider--horizontal {
    display: flex;
    clear: both;
    width: 100%;
    min-width: 100%;
    margin: var(--nuraly-divider-margin-vertical, 24px) 0;
    border-block-start: 1px var(--nuraly-divider-variant-style, solid) var(--nuraly-divider-color, rgba(5, 5, 5, 0.12));
  }

  /* Horizontal with text */
  .divider--horizontal.divider--with-text {
    display: flex;
    align-items: center;
    margin: var(--nuraly-divider-margin-vertical) 0;
    color: var(--nuraly-divider-text-color);
    font-weight: 500;
    font-size: var(--nuraly-divider-font-size);
    white-space: nowrap;
    text-align: center;
    border-block-start: 0;
  }

  .divider--horizontal.divider--with-text::before,
  .divider--horizontal.divider--with-text::after {
    position: relative;
    width: 50%;
    border-block-start: 1px var(--nuraly-divider-variant-style, solid) var(--nuraly-divider-color, rgba(5, 5, 5, 0.12));
    border-block-end: 0;
    transform: translateY(50%);
    content: '';
  }

  /* Text positioning */
  .divider--start::before {
    width: var(--nuraly-divider-orientation-margin-left, 5%);
  }

  .divider--start::after {
    width: 95%;
  }

  .divider--end::before {
    width: 95%;
  }

  .divider--end::after {
    width: var(--nuraly-divider-orientation-margin-right, 5%);
  }

  /* Text wrapper */
  .divider__text {
    display: inline-block;
    padding: 0 var(--nuraly-divider-text-padding, 1em);
    color: var(--nuraly-divider-text-color, rgba(0, 0, 0, 0.88));
    font-size: var(--nuraly-divider-font-size, 1rem);
  }

  /* Plain text style */
  .divider--plain .divider__text {
    font-weight: normal;
  }

  /* Vertical Divider */
  .divider--vertical {
    position: relative;
    top: -0.06em;
    display: inline-block;
    height: 0.9em;
    margin: 0 var(--nuraly-divider-margin-horizontal, 8px);
    vertical-align: middle;
    border-top: 0;
    border-inline-start: 1px var(--nuraly-divider-variant-style, solid) var(--nuraly-divider-color, rgba(5, 5, 5, 0.12));
  }

  /* Variant styles */
  .divider--solid {
    --nuraly-divider-variant-style: solid;
  }

  .divider--dashed {
    --nuraly-divider-variant-style: dashed;
  }

  .divider--dotted {
    --nuraly-divider-variant-style: dotted;
  }

  /* Size variations (horizontal only) */
  .divider--horizontal.divider--small {
    margin: var(--nuraly-divider-margin-vertical-small) 0;
  }

  .divider--horizontal.divider--middle {
    margin: var(--nuraly-divider-margin-vertical-middle) 0;
  }

  .divider--horizontal.divider--large {
    margin: var(--nuraly-divider-margin-vertical-large) 0;
  }
`;