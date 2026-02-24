import { css } from 'lit';

export const siderStyles = css`
  :host {
    display: block;
    position: relative;
  }

  .nr-sider {
    position: relative;
    display: flex;
    flex-direction: column;
    min-width: 0;
    background: var(--nuraly-layout-sider-background);
    color: var(--nuraly-layout-sider-text);
    border-right: 1px solid var(--nuraly-layout-sider-border);
    transition: var(--nuraly-layout-sider-transition);
  }

  :host([theme='light']) .nr-sider {
    background: var(--nuraly-layout-sider-light-background);
    color: var(--nuraly-layout-sider-light-text);
    border-right: 1px solid var(--nuraly-layout-sider-light-border);
  }

  .nr-sider-children {
    flex: 1;
    min-height: 0;
    overflow: auto;
  }

  .nr-sider-trigger {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: var(--nuraly-layout-trigger-height);
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--nuraly-layout-trigger-background);
    color: var(--nuraly-layout-trigger-text);
    cursor: pointer;
    transition: var(--nuraly-layout-transition);
    border-top: 1px solid var(--nuraly-layout-trigger-border);
    border-radius: var(--nuraly-layout-trigger-border-radius);
  }

  :host([theme='light']) .nr-sider-trigger {
    background: var(--nuraly-layout-trigger-light-background);
    color: var(--nuraly-layout-trigger-light-text);
    border-top: 1px solid var(--nuraly-layout-trigger-light-border);
  }

  .nr-sider-trigger:hover {
    background: var(--nuraly-layout-trigger-background-hover);
  }

  :host([theme='light']) .nr-sider-trigger:hover {
    background: var(--nuraly-layout-trigger-light-background-hover);
  }

  .nr-sider-zero-width-trigger {
    position: absolute;
    top: 64px;
    right: calc(-1 * var(--nuraly-layout-zero-trigger-width));
    width: var(--nuraly-layout-zero-trigger-width);
    height: var(--nuraly-layout-zero-trigger-height);
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--nuraly-layout-zero-trigger-background);
    color: var(--nuraly-layout-zero-trigger-text);
    cursor: pointer;
    transition: var(--nuraly-layout-transition);
    border-radius: var(--nuraly-layout-zero-trigger-border-radius);
    box-shadow: var(--nuraly-layout-zero-trigger-shadow);
    z-index: 1;
  }

  :host([theme='light']) .nr-sider-zero-width-trigger {
    background: var(--nuraly-layout-zero-trigger-background);
    color: var(--nuraly-layout-zero-trigger-text);
  }

  .nr-sider-zero-width-trigger:hover {
    background: var(--nuraly-layout-zero-trigger-background-hover);
  }

  .trigger-icon {
    font-size: 16px;
    line-height: 1;
  }

  .nr-sider-collapsed {
    overflow: hidden;
  }

  .nr-sider-zero-width {
    width: 0 !important;
    min-width: 0 !important;
    flex: 0 0 0 !important;
  }
`;
