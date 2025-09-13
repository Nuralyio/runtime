import { css } from 'lit';

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
    opacity: var(--nuraly-colorpicker-disabled-opacity);
    cursor: not-allowed;
  }
  :host(:not([disabled])) .color-holder {
    border: var(--nuraly-colorpicker-border-color);
  }
  :host(:not([disabled])) .color-holder:hover {
    opacity: var(--nuraly-colorpicker-hover-opacity);
  }
  :host(:not([disabled])) .color-holder:active {
    border:var(--nuraly-colorpicker-active-border)
  }
  

  :host([show]) .dropdown-container{
    display: block;
    position: fixed;
    width: 180px;
    z-index: 1;
    padding: 5px;
    background-color: var(--nuraly-colorpicker-background-color);
    box-shadow: 1px -1px 5px 1px rgba(0, 0, 0, 0.14);
    -webkit-box-shadow: 1px -1px 5px 1px rgba(0, 0, 0, 0.14);
    -moz-box-shadow: 1px -1px 5px 1px rgba(0, 0, 0, 0.14);
  }

  :host {
    --nuraly-colorpicker-background-color: #f4f4f4;
    --nuraly-colorpicker-border-color: 1px solid gray;
    --nuraly-colorpicker-active-border: 1px solid #0f62fe;
    --nuraly-colorpicker-disabled-opacity: 0.5;
    --nuraly-colorpicker-hover-opacity: 0.8;
    --nuraly-colorpicker-default-width: 30px;
    --nuraly-colorpicker-default-height: 25px;
    --nuraly-colorpicker-small-width: 20px;
    --nuraly-colorpicker-small-height: 15px;
    --nuraly-colorpicker-large-width: 35px;
    --nuraly-colorpicker-large-height: 30px;
  }
 
  @media (prefers-color-scheme: dark) {
    :host { 
      --nuraly-colorpicker-background-color: #393939;
      --nuraly-colorpicker-border-color: 1px solid #f4f4f4;
      --nuraly-colorpicker-disabled-opacity: 0.2;
    }
  }
`;
