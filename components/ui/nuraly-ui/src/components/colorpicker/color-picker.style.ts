import {css} from 'lit';

export default css`
  .color-picker-container {
    display: inline-flex;
    flex-direction: column;
  }
  hex-color-picker {
    width: 100%;
  }
  .dropdown-container {
    display: none;
  }
  hex-color-picker::part(saturation) {
    border-radius: 0px;
  }
  hex-color-picker::part(hue) {
    border-radius: 0px;
  }
  hex-color-picker::part(saturation-pointer),
  hex-color-picker::part(hue-pointer) {
    cursor: pointer;
  }
  .color-holder {
    cursor: pointer;
  }
  :host([disabled]) .color-holder {
    opacity: var(--hybrid-colorpicker-disabled-opacity);
    cursor: not-allowed;
  }
  :host(:not([disabled])) .color-holder {
    border: var(--hybrid-colorpicker-border-color);
  }
  :host(:not([disabled])) .color-holder:hover {
    opacity: var(--hybrid-colorpicker-hover-opacity);
  }
  :host(:not([disabled])) .color-holder:active {
    border:var(--hybrid-colorpicker-active-border)
  }
  

  :host([show]) .dropdown-container{
    display: block;
    position: fixed;
    max-width: 250px;
    z-index: 1;
    padding: 5px;
    background-color: var(--hybrid-colorpicker-background-color);
    box-shadow: 1px -1px 5px 1px rgba(0, 0, 0, 0.14);
    -webkit-box-shadow: 1px -1px 5px 1px rgba(0, 0, 0, 0.14);
    -moz-box-shadow: 1px -1px 5px 1px rgba(0, 0, 0, 0.14);
  }

  :host {
    --hybrid-colorpicker-background-color: #f4f4f4;
    --hybrid-colorpicker-border-color: 1px solid gray;
    --hybrid-colorpicker-active-border: 1px solid #0f62fe;
    --hybrid-colorpicker-disabled-opacity: 0.5;
    --hybrid-colorpicker-hover-opacity: 0.8;
    --hybrid-colorpicker-default-width: 30px;
    --hybrid-colorpicker-default-height: 25px;
    --hybrid-colorpicker-small-width: 20px;
    --hybrid-colorpicker-small-height: 15px;
    --hybrid-colorpicker-large-width: 35px;
    --hybrid-colorpicker-large-height: 30px;
  }
 
  @media (prefers-color-scheme: dark) {
    :host { 
      --hybrid-colorpicker-background-color: #393939;
      --hybrid-colorpicker-border-color: 1px solid #f4f4f4;
      --hybrid-colorpicker-disabled-opacity: 0.2;
    }
  }
`;
