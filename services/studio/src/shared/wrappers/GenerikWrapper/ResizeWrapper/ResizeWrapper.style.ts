import { css } from "lit";

export default css`
  :host{
   }
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
  .element.hovered .resizer-point-left-top,
  .element.hovered .resizer-point-right-top,
  .element.hovered .resizer-point-middle-top,
  .element.hovered .resizer-point-left-bottom,
  .element.hovered .resizer-point-right-bottom,
  .element.hovered .resizer-point-middle-bottom {
    display: none;
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


  .element.bordered .resizer-line-top,
  .element.bordered .resizer-line-bottom {
    border-top: 1px dashed var(--editor-selection-color, #b5b5b5);
  }
  .element.bordered .resizer-line-right {
    border-right: 1px dashed var(--editor-selection-color, #b5b5b5);
    margin-left: 5px;
  }
  .element.bordered .resizer-line-left {
    border-left: 1px dashed var(--editor-selection-color, #b5b5b5);
  }



  .element.hovered .resizer-line-top,
  .element.hovered .resizer-line-bottom {
    border-top: 1px dashed var(--editor-selection-color, #79ade6);
  }
  .element.hovered .resizer-line-right {
    border-right: 1px dashed var(--editor-selection-color, #79ade6);
    margin-left: 5px;
  }
  .element.hovered .resizer-line-left {
    border-left: 1px dashed var(--editor-selection-color, #79ade6);
  }


  .element.selected .resizer-line-top,
  .element.selected .resizer-line-bottom {
    border-top: 1px solid var(--editor-selection-color, #79ade6);
  }
  .element.selected .resizer-line-right {
    border-right: 1px solid var(--editor-selection-color, #79ade6);
  }
  .element.selected .resizer-line-left {
    border-left: 1px solid var(--editor-selection-color, #79ade6);
  }



`;
