import { css } from "lit";

export default css`
   .quick-action{
    display: inline-flex;
    align-items: center;
    padding: 3px;
    position: absolute;
    z-index: 10;
    border-radius: 5px;
    background: #f0f0f0;
    box-shadow: 0 0 5px 0 rgb(0 0 0 / 20%);
    border: 1px solid #ccc;
  }

 @media (prefers-color-scheme: dark) {
  .quick-action{
      background: rgb(44, 44, 44)
   }
 }



 micro-app {
          /* Input Styles */
          --nuraly-input-border-radius: 5px;
          /* --nuraly-input-border-bottom: 1px solid #a8a8a8;
          --nuraly-input-border-top: 1px solid #a8a8a8;
          --nuraly-input-border-left: 1px solid #a8a8a8;
          --nuraly-input-border-right: 1px solid #a8a8a8;*/
          --nuraly-input-border-bottom: 2px solid transparent;
          --nuraly-input-number-icons-container-width: 48px;
          --nuraly-input-font-family: Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Ubuntu, Cantarell, "Noto Sans", sans-serif, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, SFProLocalRange;
          --nuraly-input-font-size: 12px;

          /* Select Styles */
          --nuraly-select-icon-width: 11px;
          --nuraly-select-border-bottom: 1px solid #a8a8a8;
          --nuraly-select-border-top: 1px solid #a8a8a8;
          --nuraly-select-border-left: 1px solid #a8a8a8;
          --nuraly-select-border-right: 1px solid #a8a8a8;
          --nuraly-select-border-radius: 5px;
          --nuraly-select-focus-border: 1px solid gray;

          /* Button Styles */
          --nuraly-button-background-color: rgb(245, 245, 245);;
          --nuraly-button-text-color: #535353;
          --nuraly-button-border-left: 1px solid #a8a8a8;
          --nuraly-button-border-right: 1px solid #a8a8a8;
          --nuraly-button-border-top: 1px solid #a8a8a8;
          --nuraly-button-border-bottom: 1px solid #a8a8a8;

          /* Collapse Styles */
          --nr-collapse-content-background-color: transparent;
      }

      /* ===============================
         Dark Mode Styles
         =============================== */
      @media (prefers-color-scheme: dark) {
          micro-app {
              /* Input Styles (Dark Mode) */

              /* Select Styles (Dark Mode) */
              --nuraly-input-border-bottom: 1px solid transparent;
              --nuraly-input-border-top: 1px solid transparent;
              --nuraly-input-border-left: 1px solid transparent;
              --nuraly-input-border-right: 1px solid transparent;
              --nuraly-input-focus-border: 1px solid #a8a8a8;

              --nuraly-select-focus-border: 1px solid #ffffff;

              /* Button Styles (Dark Mode) */
              --nuraly-button-border-left: 1px solid #272626;
              --nuraly-button-border-right: 1px solid #272626;
              --nuraly-button-border-top: 1px solid #272626;
              --nuraly-button-border-bottom: 1px solid #272626;
              --nuraly-button-background-color: #494949;
              --nuraly-button-text-color: #ffffff;
              --nuraly-button-primary-background-color: #212121;
              --nuraly-button-primary-border-color: #212121;
              --nuraly-button-primary-hover-border-color: #212121;
              --nuraly-button-hover-border-color : #212121;
              --nuraly-button-active-border-color: #212121;
              --nuraly-button-active-background-color: #212121;
              --nuraly-button-primary-hover-border-color: #212121;
              --nuraly-button-primary-hover-background-color: #212121;
              --nuraly-button-hover-background-color: #3b3b3b;
              /* Collapse Styles (Dark Mode) */
              --nr-collapse-border: 1px solid #a8a8a8;
              --nr-collapse-header-hover-background-color: #3a3a3a;
              --nr-collapse-header-collapsed-background-color: #3a3a3a;
              --nuraly-button-hover-color: #ffffff;
              --nuraly-select-options-background-color: #0a0a0a;

          }
         
      }
`;
