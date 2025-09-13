import { css } from 'lit';

export const styles = css`
  :host{
    display: block;
    height: 100%;
  }
   .tabs-container{
    border-radius: var(--nuraly-tabs-border-radius, var(--nuraly-tabs-border-radius-local));
    background-color:var(--nuraly-tabs-container-background-color, var(--nuraly-tabs-container-background-local-color));
    height: 100%;
   }
  .tab-labels,
  .tabs-container {
    display: flex;
  }

  .tabs-container {
    box-shadow: var(--nuraly-tabs-container-box-shadow);
  }

  .dragging-start {
    border: var(--nuraly-tabs-dragging-start-border);
  }
  .dragging-enter {
    background-color: var(--nuraly-tabs-dragging-enter-background-color);
  }
  .vertical-align > .tab-content {
    border: var(--nuraly-tabs-va-enter-border);
    border-left: var(--nuraly-tabs-va-enter-border-left);
  }
  .vertical-align.right-align > .tab-content {
    border: var(--nuraly-tabs-va-ra-border);
    border-right: var(--nuraly-tabs-va-ra-border-right);
  }

  .tab-label {
    cursor: var(--nuraly-tabs-label-cursor);
    padding: var(--nuraly-tabs-label-padding);
    border-bottom: var(--nuraly-tabs-label-border-bottom);
    transition: var(--nuraly-tabs-label-transition);
    user-select: var(--nuraly-tabs-label-user-select);
    color:var(--nuraly-tabs-label-color);
  }

  .tab-label:hover {
    color: var(--nuraly-tabs-label-hover-color);
  }

  .tab-label.active {
    color: var(--nuraly-tabs-label-active-hover-color);
    border-top-left-radius: var(--nuraly-tabs-label-active-border-left-radius, 0);
    border-top-right-radius: var(--nuraly-tabs-label-active-border-right-radius, 0);
  }

  .tab-content {
    padding: var(--nuraly-tabs-content-padding);
    margin: var(--nuraly-tabs-content-maring);
    flex-grow: 1;
    background-color: var(--nuraly-tabs-content-background-color, var(--nuraly-tabs-content-background-color-local));
    border-top: var(--nuraly-tabs-content-border-top);
    max-height:100vh;
    overflow-y:auto;
    overflow-x:hidden;
  }
  .right-align > .tab-labels {
    flex-direction: var(--nuraly-tabs-right-align-labels-flex-direction);
    align-self: var(--nuraly-tabs-right-align-labels-align-self);
  }

  .center-align > .tab-labels {
    align-self: var(--nuraly-tabs-center-align-labels-align-self);
  }
  .vertical-align {
    flex-direction: var(--nuraly-tabs-vertical-align-flex-direction);
  }
  .horizontal-align {
    flex-direction: var(--nuraly-tabs-halign-flex-direction);
  }

  .vertical-align.right-align {
    flex-direction: var(--nuraly-tabs-valign-right-align-flex-direction);
  }

  .tab-label:hover,
  .tab-label.active {
    border-bottom: var(--nuraly-tabs-label-active-border-bottom);
    border-color: var(--nuraly-tabs-label-active-border-color);
  }

  .tab-label.active {
    color: var(--nuraly-tabs-label-active-hover-color);
  }

  .vertical-align .tab-label {
    border: var(--nuraly-tabs-vertical-align-label-border);
    border-right: var(--nuraly-tabs-vertical-align-label-border-right);
  }

  .vertical-align.right-align .tab-label {
    border: var(--nuraly-tabs-valign-ralign-label-border);
    border-left: var(--nuraly-tabs-valign-ralign-label-border-left);
  }

  .vertical-align .tab-label:hover,
  .vertical-align .tab-label.active {
    border: var(--nuraly-tabs-vertical-align-label-border-active);
    border-right: var(--nuraly-tabs-vertical-align-label-border-right-active);
    border-color: var(--nuraly-tabs-vertical-align-label-border-color-active);
  }
  .vertical-align.right-align .tab-label:hover,
  .vertical-align.right-align .tab-label.active {
    border: var(--nuraly-tabs-valign-ralign-label-border-active);
    border-left: var(--nuraly-tabs-valign-ralign-label-border-left-active);
    border-color: var(--nuraly-tabs-valign-ralign-label-border-color-active);
  }

  .close-icon {
    font-size: var(--nuraly-tabs-add-icon-font-size);
    vertical-align: bottom;
    margin-left: var(--nuraly-tabs-add-icon-margin-left);
  }

  .add-tab-label {
    font-size: var(--nuraly-tabs-add-label-font-size);
    text-align: var(--nuraly-tabs-add-label-text-align);
  }
  .dragging {
    border: var(--nuraly-tabs-dragging-border) !important;
    opacity: 0.8;
    color: #464646 !important;
  }
  .tab-label.active {
    color: var(--nuraly-tabs-label-active);
    background-color: var(--nuraly-tabs-label-active-background-color); /* Added background color */
  } 
  .add-tab-icon{
    --nuraly-icon-color:var(--nuraly-tabs-add-icon-color);
  }
  :host{
    --nuraly-tabs-container-background-local-color:#ffffff;
    --nuraly-tabs-border-radius-local:0px;
    --nuraly-tabs-container-box-shadow:none;
    --nuraly-tabs-dragging-start-border:1px dashed black;
    --nuraly-tabs-dragging-enter-background-color:#1661b1;
    --nuraly-tabs-va-enter-border: none;
    --nuraly-tabs-va-enter-border-left: 1px solid #ccc;
    --nuraly-tabs-va-ra-border:none;
    --nuraly-tabs-va-ra-border-right:1px solid #ccc;
    --nuraly-tabs-label-cursor:pointer;
    --nuraly-tabs-label-padding: 3px 7px 5px 7px;
    --nuraly-tabs-label-border-bottom: 2px solid transparent;
    --nuraly-tabs-label-transition: border-color 0.1s ease;
    --nuraly-tabs-label-user-select: none;
    --nuraly-tabs-label-hover-color: #1661b1;
    --nuraly-tabs-label-active-hover-color:#006afe;
    --nuraly-tabs-content-padding:5px;
    --nuraly-tabs-content-background-color-local: #fff;
    --nuraly-tabs-content-border-top: 1px solid #ccc;
    --nuraly-tabs-right-align-labels-flex-direction:row-reverse;
    --nuraly-tabs-right-align-labels-align-self: end;
    --nuraly-tabs-center-align-labels-align-self:center;
    --nuraly-tabs-vertical-align-flex-direction:row;
    --nuraly-tabs-halign-flex-direction:column;
    --nuraly-tabs-valign-right-align-flex-direction:row-reverse;
    --nuraly-tabs-label-active-border-bottom:2px solid transparent;
    --nuraly-tabs-label-active-border-color: rgb(0, 106, 254);
    --nuraly-tabs-label-active-hover-color: #006afe;
    --nuraly-tabs-vertical-align-label-border: #006afe;
    --nuraly-tabs-vertical-align-label-border-right: 2px solid transparent;
    --nuraly-tabs-valign-ralign-label-border: none;
    --nuraly-tabs-valign-ralign-label-border-left: 2px solid transparent;
    --nuraly-tabs-vertical-align-label-border-active: none;
    --nuraly-tabs-vertical-align-label-border-right-active: 2px solid transparent;
    --nuraly-tabs-vertical-align-label-border-color-active: rgb(0, 106, 254);
    --nuraly-tabs-valign-ralign-label-border-active: none;
    --nuraly-tabs-valign-ralign-label-border-left-active: 2px solid transparent;
    --nuraly-tabs-valign-ralign-label-border-color-active: rgb(0, 106, 254);
    --nuraly-tabs-add-icon-font-size: 13px;
    --nuraly-tabs-add-icon-margin-left: 5px;
    --nuraly-tabs-add-label-font-size: 13px;
    --nuraly-tabs-add-label-text-align: center;
    --nuraly-tabs-dragging-border: 1px dashed gray;
    --nuraly-tabs-label-active: #000000;
    --nuraly-tabs-label-color:gray;
    --nuraly-tabs-add-icon-color: #000000;
    --nuraly-tabs-label-active-background-color: transparent; /* Added variable */
  }
  @media (prefers-color-scheme: dark) {
    :host{
      --nuraly-tabs-container-background-local-color: #3e3e3e;
      --nuraly-tabs-content-background-color-local: #2d2d2d;
      --nuraly-tabs-label-hover-color: #aaa;
      --nuraly-tabs-label-active:#ffffff;   
      --nuraly-tabs-add-icon-color: #ffffff;
      --nuraly-tabs-label-active-background-color: #2d2d2d; /* Dark mode background */
    }
  }
`;