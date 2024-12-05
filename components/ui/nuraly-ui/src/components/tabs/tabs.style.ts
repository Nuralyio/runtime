import {css} from 'lit';

export const styles = css`
  :host{
    display: block;
    height: 100%;
  }
   .tabs-container{
    background-color:var(--hybrid-tabs-container-background-color);
    height: 100%;
   }
  .tab-labels,
  .tabs-container {
    display: flex;
  }

  .tabs-container {
    box-shadow: var(--hybrid-tabs-container-box-shadow);
  }

  .dragging-start {
    border: var(--hybrid-tabs-dragging-start-border);
  }
  .dragging-enter {
    background-color: var(--hybrid-tabs-dragging-enter-background-color);
  }
  .vertical-align > .tab-content {
    border: var(--hybrid-tabs-va-enter-border);
    border-left: var(--hybrid-tabs-va-enter-border-left);
  }
  .vertical-align.right-align > .tab-content {
    border: var(--hybrid-tabs-va-ra-border);
    border-right: var(--hybrid-tabs-va-ra-border-right);
  }

  .tab-label {
    cursor: var(--hybrid-tabs-label-cursor);
    padding: var(--hybrid-tabs-label-padding);
    border-bottom: var(--hybrid-tabs-label-border-bottom);
    transition: var(--hybrid-tabs-label-transition);
    user-select: var(--hybrid-tabs-label-user-select);
    color:var(--hybrid-tabs-label-color);
  }

  .tab-label:hover {
    color: var(--hybrid-tabs-label-hover-color);
  }

  .tab-label.active {
    color: var(--hybrid-tabs-label-active-hover-color);
  }

  .tab-content {
    padding: var(--hybrid-tabs-content-padding);
    flex-grow: 1;
    background-color: var(--hybrid-tabs-content-background-color);
    border-top: var(--hybrid-tabs-content-border-top);
    max-height:100vh;
    overflow-y:auto;
    overflow-x:hidden;
  }
  .right-align > .tab-labels {
    flex-direction: var(--hybrid-tabs-right-align-labels-flex-direction);
    align-self: var(--hybrid-tabs-right-align-labels-align-self);
  }

  .center-align > .tab-labels {
    align-self: var(--hybrid-tabs-center-align-labels-align-self);
  }
  .vertical-align {
    flex-direction: var(--hybrid-tabs-vertical-align-flex-direction);
  }
  .horizontal-align {
    flex-direction: var(--hybrid-tabs-halign-flex-direction);
  }

  .vertical-align.right-align {
    flex-direction: var(--hybrid-tabs-valign-right-align-flex-direction);
  }

  .tab-label:hover,
  .tab-label.active {
    border-bottom: var(--hybrid-tabs-label-active-border-bottom);
    border-color: var(--hybrid-tabs-label-active-border-color);
  }

  .tab-label.active {
    color: var(--hybrid-tabs-label-active-hover-color);
  }

  .vertical-align .tab-label {
    border: var(--hybrid-tabs-vertical-align-label-border);
    border-right: var(--hybrid-tabs-vertical-align-label-border-right);
  }

  .vertical-align.right-align .tab-label {
    border: var(--hybrid-tabs-valign-ralign-label-border);
    border-left: var(--hybrid-tabs-valign-ralign-label-border-left);
  }

  .vertical-align .tab-label:hover,
  .vertical-align .tab-label.active {
    border: var(--hybrid-tabs-vertical-align-label-border-active);
    border-right: var(--hybrid-tabs-vertical-align-label-border-right-active);
    border-color: var(--hybrid-tabs-vertical-align-label-border-color-active);
  }
  .vertical-align.right-align .tab-label:hover,
  .vertical-align.right-align .tab-label.active {
    border: var(--hybrid-tabs-valign-ralign-label-border-active);
    border-left: var(--hybrid-tabs-valign-ralign-label-border-left-active);
    border-color: var(--hybrid-tabs-valign-ralign-label-border-color-active);
  }

  .close-icon {
    font-size: var(--hybrid-tabs-add-icon-font-size);
    vertical-align: bottom;
    margin-left: var(--hybrid-tabs-add-icon-margin-left);
  }

  .add-tab-label {
    font-size: var(--hybrid-tabs-add-label-font-size);
    text-align: var(--hybrid-tabs-add-label-text-align);
  }
  .dragging {
    border: var(--hybrid-tabs-dragging-border) !important;
    opacity: 0.8;
    color: #464646 !important;
  }
  .tab-label.active {
    color: var(--hybrid-tabs-label-active);
    font-weight: bold;
  } 
  .add-tab-icon{
    --hybrid-icon-color:var(--hybrid-tabs-add-icon-color);
  }
  :host{
    --hybrid-tabs-container-background-color:#ffffff;
    --hybrid-tabs-container-box-shadow:none;
    --hybrid-tabs-dragging-start-border:1px dashed black;
    --hybrid-tabs-dragging-enter-background-color:#1661b1;
    --hybrid-tabs-va-enter-border: none;
    --hybrid-tabs-va-enter-border-left: 1px solid #ccc;
    --hybrid-tabs-va-ra-border:none;
    --hybrid-tabs-va-ra-border-right:1px solid #ccc;
    --hybrid-tabs-label-cursor:pointer;
    --hybrid-tabs-label-padding: 7px 7px 5px 7px;
    --hybrid-tabs-label-border-bottom: 2px solid transparent;
    --hybrid-tabs-label-transition: border-color 0.1s ease;
    --hybrid-tabs-label-user-select: none;
    --hybrid-tabs-label-hover-color: #1661b1;
    --hybrid-tabs-label-active-hover-color:#006afe;
    --hybrid-tabs-content-padding:10px;
    --hybrid-tabs-content-background-color: #fff;
    --hybrid-tabs-content-border-top: 1px solid #ccc;
    --hybrid-tabs-right-align-labels-flex-direction:row-reverse;
    --hybrid-tabs-right-align-labels-align-self: end;
    --hybrid-tabs-center-align-labels-align-self:center;
    --hybrid-tabs-vertical-align-flex-direction:row;
    --hybrid-tabs-halign-flex-direction:column;
    --hybrid-tabs-valign-right-align-flex-direction:row-reverse;
    --hybrid-tabs-label-active-border-bottom:2px solid transparent;
    --hybrid-tabs-label-active-border-color: rgb(0, 106, 254);
    --hybrid-tabs-label-active-hover-color: #006afe;
    --hybrid-tabs-vertical-align-label-border: #006afe;
    --hybrid-tabs-vertical-align-label-border-right: 2px solid transparent;
    --hybrid-tabs-valign-ralign-label-border: none;
    --hybrid-tabs-valign-ralign-label-border-left: 2px solid transparent;
    --hybrid-tabs-vertical-align-label-border-active: none;
    --hybrid-tabs-vertical-align-label-border-right-active: 2px solid transparent;
    --hybrid-tabs-vertical-align-label-border-color-active: rgb(0, 106, 254);
    --hybrid-tabs-valign-ralign-label-border-active: none;
    --hybrid-tabs-valign-ralign-label-border-left-active: 2px solid transparent;
    --hybrid-tabs-valign-ralign-label-border-color-active: rgb(0, 106, 254);
    --hybrid-tabs-add-icon-font-size: 13px;
    --hybrid-tabs-add-icon-margin-left: 5px;
    --hybrid-tabs-add-label-font-size: 13px;
    --hybrid-tabs-add-label-text-align: center;
    --hybrid-tabs-dragging-border: 1px dashed gray;
    --hybrid-tabs-label-active: #000000;
    --hybrid-tabs-label-color:gray;
    --hybrid-tabs-add-icon-color: #000000;
  }
  @media (prefers-color-scheme: dark) {
    :host{
      --hybrid-tabs-container-background-color: #000000;
      --hybrid-tabs-content-background-color: #2d2d2d;
      --hybrid-tabs-label-hover-color: #aaa;
      --hybrid-tabs-label-active:#ffffff;   
      --hybrid-tabs-add-icon-color: #ffffff;
    }
  }
`;
