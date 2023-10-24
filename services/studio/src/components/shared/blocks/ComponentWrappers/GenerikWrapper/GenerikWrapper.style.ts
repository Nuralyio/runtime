import { css } from "lit";

const ComponentWrapperStyle = css`
  .resizer-line-top,
  .resizer-line-bottom,
  .resizer-line-right,
  .resizer-line-left,
  .resizer-point-left-top,
  .resizer-point-right-top,
  .resizer-point-middle-top,
  .resizer-point-left-bottom,
  .resizer-point-right-bottom,
  .resizer-point-middle-bottom {
    position: absolute;
    z-index: 4;
  }
  .element.selected .resizer-point-left-top,
  .element.selected .resizer-point-right-top,
  .element.selected .resizer-point-middle-top,
  .element.selected .resizer-point-left-bottom,
  .element.selected .resizer-point-right-bottom,
  .element.selected .resizer-point-middle-bottom {
    background-color: var(--editor-selection-color, #79ade6);
    border-radius: 2px;
    width: 6px;
    height: 6px;
    z-index: 5;
    margin-top: -2px;
  }
  .resizer-point-middle-top {
    cursor: n-resize;
  }

  .resizer-point-right-top {
    cursor: ne-resize;
  }
  .resizer-point-left-top {
    cursor: nw-resize;
  }

  .resizer-point-right-bottom {
    cursor: se-resize;
  }
  .resizer-point-left-bottom {
    cursor: sw-resize;
  }
  .resizer-point-middle-bottom {
    cursor: s-resize;
  }
  .element.selected .resizer-line-top,
  .element.selected .resizer-line-bottom {
    border-top: 1px solid var(--editor-selection-color, #79ade6);
  }
  .element.selected .resizer-line-right {
    border-right: 1px solid var(--editor-selection-color, #79ade6);
    margin-left: 5px;
  }
  .element.selected .resizer-line-left {
    border-left: 1px solid var(--editor-selection-color, #79ade6);
  }

  .component-name {
    position: absolute;
    display: none;
    z-index: 7;
    padding: 1px;
    background: #2395ff;
    color: white;
    font-weight: 300;
    font-size: 14px;
    cursor: pointer;
    user-select: none;
    margin-top: -22px;
  }
  .element.selected .component-name {
    display: block;
  }
  :host {
    display: flex;
  }

  @keyframes change-height {
    0% {
      height: 500px;
    }
    50% {
      height: 50px;
    }
    100% {
      height: 500px;
    }
  }

  .drop-zone {
    display: none;
    border: 2px dashed rgb(110 110 110);
  }

  ::host .selected {
    background-color: var(--editor-selection-color, #79ade6) !important;
  }


`;

export default [ComponentWrapperStyle];
