import {css, html} from 'lit';

const baseButtonStyle = css`
  button {
    display: inline-block;
    user-select: none;
    padding-top: var(--hybrid-button-padding-y, 0.5rem);
    padding-bottom: var(--hybrid-button-padding-x, 0.5rem);
    padding-right: var(--hybrid-button-padding-r, 0.8rem);
    padding-left: var(--hybrid-button-padding-l, 0.8rem);
    border-radius: var(--hybrid-button-border-radius, 0.25rem);
    border-top-left-radius: var(--hybrid-button-border-top-left-radius, 0.25rem);
    border-top-right-radius: var(--hybrid-button-border-top-right-radius, 0.25rem);
    border-bottom-left-radius: var(--hybrid-button-border-bottom-left-radius, 0.25rem);
    border-bottom-right-radius: var(--hybrid-button-border-bottom-right-radius, 0.25rem);

    border-width: var(--hybrid-button-border-width, 1px);
    border-right-width: var(--hybrid-button-border-right-width, var(--hybrid-button-border-width, 1px));
    border-left-width: var(--hybrid-button-border-left-width, var(--hybrid-button-border-width, 1px));

    border-color: var(--hybrid-button-border-color, #d0d0d0);
    background-color: var(--hybrid-button-background-color, #f9f9f9);
    border-style: solid;
    color: var(--hybrid-button-text-color, #393939);
    font-size: var(--hybrid-button-font-size, 0.8rem);
    font-weight: var(--hybrid-button-font-weight, normal);
    text-transform: var(--hybrid-button-text-transform, none);
  }

  button:hover:not(:disabled) {
    cursor: pointer;
    border-color: var(--hybrid-button-hover-border-color, #1677ff);
    color: var(--hybrid-button-hover-color, #1677ff);
  }

  button:active:not(:disabled) {
    outline: none;
    border-color: var(--hybrid-button-active-border-color, #1661b1);
    color: var(--hybrid-button-active-color, #184d86);
  }

  button[data-display='block'] {
    width: 100%;
  }

  button[data-size='small'] {
    padding-top: var(--hybrid-small-button-padding-y, 0.3rem);
    padding-bottom: var(--hybrid-small-button-padding-y, 0.3rem);
    padding-right: var(--hybrid-small-button-padding-x, 0.6rem);
    padding-left: var(--hybrid-small-button-padding-x, 0.6rem);
  }

  button[data-size='large'] {
    padding-top: var(--hybrid-small-button-padding-y, 0.6rem);
    padding-bottom: var(--hybrid-small-button-padding-y, 0.6rem);
    padding-right: var(--hybrid-small-button-padding-x, 0.9rem);
    padding-left: var(--hybrid-small-button-padding-x, 0.9rem);
    font-size: var(--hybrid-small-button-font-size, 0.9rem);
  }

  button[data-state='loading'] {
    opacity: 0.5;
  }

  :host {
    user-select: none;
    -webkit-user-select: none;
  }
`;

const dangerButtonStyle = css`
  button[data-danger] {
    border-color: var(--hybrid-button-border-color, #ff4a00);
    color: var(--hybrid-button-danger-text-color, #ffffff);
  }

  button[data-danger]:not([data-type='primary']):not(:disabled) {
    color: var(--hybrid-button-danger-text-color, #ff4a00);
    border-color: var(--hybrid-button-danger-border-color, #ff4a00);
  }

  button[data-danger]:not([data-type='primary']):hover:not(:disabled) {
    color: var(--hybrid-button-danger-hover-text-color, #ff4a00);
    border-color: var(--hybrid-button-danger-hover-border-color, #ff4a00);
    opacity: 0.9;
  }

  button[data-danger]:not([data-type='primary']):active:not(:disabled) {
    color: var(--hybrid-button-danger-active-text-color, #ff4a00);
    border-color: var(--hybrid-button-danger-active-border-color, #ff4a00);
    opacity: 1;
  }

  button[data-danger][data-type='primary']:not(:disabled) {
    color: var(--hybrid-button-danger-text-color, #ffffff);
    background-color: var(--hybrid-primary-button-danger-background-color, #ff4a00);
    border-color: var(--hybrid-primary-button-danger-border-color, #ff4a00);
  }

  button[data-danger][data-type='primary']:hover:not(:disabled) {
    color: var(--hybrid-button-danger-text-color, #ffffff);
    background-color: var(--hybrid-primary-button-danger-hover-background-color, #ff4a00);
    border-color: var(--hybrid-primary-button-danger-hover-border-color, #ff4a00);
    opacity: 0.9;
  }

  button[data-danger][data-type='primary']:active:not(:disabled) {
    color: var(--hybrid-button-danger-text-color, #ffffff);
    background-color: var(--hybrid-primary-button-danger-hover-background-color, #ff4a00);
    border-color: var(--hybrid-primary-button-danger-hover-border-color, #ff4a00);
    opacity: 1;
  }
`;

const disabledButtonStyle = css`
  button:disabled {
    cursor: auto;
    background-color: var(--hybrid-button-disabled-background-color, #ccc);
    color: var(--hybrid-button-disabled-text-color, #999);
    border-color: var(--hybrid-button-disabled-border-color, #bbb);
  }
  button:focus {
    outline: none;
    box-shadow: none;
  }
  button:active:not(:disabled) {
    outline: none;
    border-color: #aaa;
    box-shadow: none;
  }

  button:disabled:hover {
    cursor: not-allowed;
  }
`;

const primaryButtonStyle = css`
  button[data-type='primary'] {
    border-color: var(--hybrid-button-primary-border-color, #1277e1);
    background-color: var(--hybrid-button-primary-background-color, #1277e1);
    color: var(--hybrid-button-primary-text-color, #ffffff);
  }

  button[data-type='primary']:hover:not(:disabled) {
    cursor: pointer;
    background-color: var(--hybrid-button-primary-hover-background-color, #0a70ff);
    border-color: var(--hybrid-button-primary-hover-border-color, #1677ff);
    color: var(--hybrid-button-primary-text-color, #ffffff);
  }
  button[data-type='primary']:active:not(:disabled) {
    cursor: pointer;
    background-color: var(--hybrid-button-primary-active-background-color, #0559cf);
    border-color: var(--hybrid-button-primary-active-border-color, #1677ff);
  }
`;

const dashedButtonStyle = css`
  button[data-type='dashed'] {
    border-style: dashed;
  }

  button[data-type='dashed']:hover:not(:disabled) {
    cursor: pointer;

    border-color: var(--hybrid-button-dashed-hover-border-color, #1677ff);
    color: var(--hybrid-button-dashed-hover-text-color, #1677ff);
  }
  button[data-type='dashed']:active:not(:disabled) {
    cursor: pointer;
    border-color: var(--hybrid-button-dashed-active-border-color, #1677ff);
  }
`;

const textButtonStyle = css`
  button[data-type='text'] {
    border: none;
  }
  button[data-type='text']:hover:not(:disabled) {
    cursor: pointer;

    background-color: var(--hybrid-button-text-hover-background-color, #e1e1e1);
  }
  button[data-type='text']:active:not(:disabled) {
    cursor: pointer;
    background-color: var(--hybrid-button-text-active-background-color, #c1c1c1);
  }
  button[data-type='text'] {
    border-style: text;
  }

  button[data-type='text']:hover:not(:disabled) {
    cursor: pointer;
  }
`;

const linkButtonStyle = css`
  button[data-type='link'] {
    border: none;
    color: var(--hybrid-button-link-text-color, #1677ff);
    background-color: transparent;
  }
  button[data-type='link']:hover:not(:disabled) {
    cursor: pointer;
    color: var(--hybrid-button-link-hover-text-color, #4a96ff);
  }
  button[data-type='link']:active:not(:disabled) {
    cursor: pointer;
    color: var(--hybrid-button-link-active-text-color, #0862df);
  }
`;

const iconButtonStyle = css`
  .icon-only {
    width: 32px;
    padding-left: 0.6rem;
  }
  .icon-only[data-size='large'] {
    width: 42px;
    padding-left: 0.9rem;
  }

  .button-rounded {
    border-radius: 50%;
  }
`;

const usedAsStyle = css`
  button[data-usedas='post'] {
    border-radius: var(--hybrid-button-usedas-post-border-radius, 0 0.3rem 0.3rem 0);
    height: 100%;
  }
  button[data-usedas='pre'] {
    border-radius: var(--hybrid-button-usedas-post-border-radius, 0.3rem 0 0 0.3rem);
    height: 100%;
  }
`;

export const styles = [
  baseButtonStyle,
  dangerButtonStyle,
  primaryButtonStyle,
  dashedButtonStyle,
  textButtonStyle,
  linkButtonStyle,
  iconButtonStyle,
  disabledButtonStyle,
  usedAsStyle,
  css`

 @media (prefers-color-scheme: dark) {
  

  button {
    background-color: var(--hybrid-button-background-color, rgb(44, 44, 44));
    color: var(--hybrid-button-text-color, #ffffff);
  }


  
  button[data-type='primary'] {
    border-color: var(--hybrid-button-dark-primary-border-color, #4a96ff);
    background-color: var(--hybrid-button-dark-primary-background-color, rgb(44, 44, 44));
    color: var(--hybrid-button-dark-primary-text-color, #ffffff);
  }

 }


  `,
];

export const hostBlockStyle = html`<style>
  :host {
    width: 100%;
  }
</style>`;
