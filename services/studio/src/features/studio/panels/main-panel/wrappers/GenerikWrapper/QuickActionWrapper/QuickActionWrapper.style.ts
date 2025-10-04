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
          --hybrid-input-border-radius: 5px;
          /* --hybrid-input-border-bottom: 1px solid #a8a8a8;
          --hybrid-input-border-top: 1px solid #a8a8a8;
          --hybrid-input-border-left: 1px solid #a8a8a8;
          --hybrid-input-border-right: 1px solid #a8a8a8;*/
          --hybrid-input-border-bottom: 2px solid transparent;
          --hybrid-input-number-icons-container-width: 48px;
          --hybrid-input-font-family: Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Ubuntu, Cantarell, "Noto Sans", sans-serif, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, SFProLocalRange;
          --hybrid-input-font-size: 12px;

          /* Select Styles */
          --hybrid-select-icon-width: 11px;
          --hybrid-select-border-bottom: 1px solid #a8a8a8;
          --hybrid-select-border-top: 1px solid #a8a8a8;
          --hybrid-select-border-left: 1px solid #a8a8a8;
          --hybrid-select-border-right: 1px solid #a8a8a8;
          --hybrid-select-border-radius: 5px;
          --hybrid-select-focus-border: 1px solid gray;

          /* Button Styles */
          --hybrid-button-background-color: rgb(245, 245, 245);;
          --hybrid-button-text-color: #535353;
          --hybrid-button-border-left: 1px solid #a8a8a8;
          --hybrid-button-border-right: 1px solid #a8a8a8;
          --hybrid-button-border-top: 1px solid #a8a8a8;
          --hybrid-button-border-bottom: 1px solid #a8a8a8;

          /* Collapse Styles */
          --hy-collapse-content-background-color: transparent;
      }

      /* ===============================
         Dark Mode Styles
         =============================== */
      @media (prefers-color-scheme: dark) {
          micro-app {
              /* Input Styles (Dark Mode) */

              /* Select Styles (Dark Mode) */
              --hybrid-input-border-bottom: 1px solid transparent;
              --hybrid-input-border-top: 1px solid transparent;
              --hybrid-input-border-left: 1px solid transparent;
              --hybrid-input-border-right: 1px solid transparent;
              --hybrid-input-focus-border: 1px solid #a8a8a8;

              --hybrid-select-focus-border: 1px solid #ffffff;

              /* Button Styles (Dark Mode) */
              --hybrid-button-border-left: 1px solid #272626;
              --hybrid-button-border-right: 1px solid #272626;
              --hybrid-button-border-top: 1px solid #272626;
              --hybrid-button-border-bottom: 1px solid #272626;
              --hybrid-button-background-color: #494949;
              --hybrid-button-text-color: #ffffff;
              --hybrid-button-primary-background-color: #212121;
              --hybrid-button-primary-border-color: #212121;
              --hybrid-button-primary-hover-border-color: #212121;
              --hybrid-button-hover-border-color : #212121;
              --hybrid-button-active-border-color: #212121;
              --hybrid-button-active-background-color: #212121;
              --hybrid-button-primary-hover-border-color: #212121;
              --hybrid-button-primary-hover-background-color: #212121;
              --hybrid-button-hover-background-color: #3b3b3b;
              /* Collapse Styles (Dark Mode) */
              --hy-collapse-border: 1px solid #a8a8a8;
              --hy-collapse-header-hover-background-color: #3a3a3a;
              --hy-collapse-header-collapsed-background-color: #3a3a3a;
              --hybrid-button-hover-color: #ffffff;
              --hybrid-select-options-background-color: #0a0a0a;

          }
         
      }
`;
