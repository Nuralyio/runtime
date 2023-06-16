import {css} from 'lit';

export const styles = css`
  .tab-labels,
  .tabs-container {
    display: flex;
  }

  .tabs-container {
    box-shadow: var(--hybrid-tabs-container-box-shadow, none);
  }

  .dragging-start {
    border: var(--hybrid-tabs-dragging-start-border, 1px dashed black);
  }
  .dragging-enter {
    background-color: var(--hybrid-tabs-dragging-enter-background-color, #1661b1);
  }
  .vertical-align > .tab-content {
    border: var(--hybrid-tabs-va-enter-border, none);
    border-left: var(--hybrid-tabs-va-enter-border-left, 1px solid #ccc);
  }
  .vertical-align.right-align > .tab-content {
    border: var(--hybrid-tabs-va-ra-border, none);
    border-right: var(--hybrid-tabs-va-ra-border-right, 1px solid #ccc);
  }

  .tab-label {
    cursor: var(--hybrid-tabs-label-cursor, pointer);
    padding: var(--hybrid-tabs-label-padding, 7px 7px 5px 7px);
    border-bottom: var(--hybrid-tabs-label-border-bottom, 2px solid transparent);
    transition: var(--hybrid-tabs-label-transition, border-color 0.1s ease);
    user-select: var(--hybrid-tabs-label-user-select, none);
  }

  .tab-label:hover {
    color: var(--hybrid-tabs-label-hover-color, #1661b1);
  }

  .tab-label.active {
    color: var(--hybrid-tabs-label-active-hover-color, #006afe);
  }

  .tab-content {
    padding: var(--hybrid-tabs-content-padding, 10px);
    flex-grow: var(--hybrid-tabs-content-padding, 1);
    background-color: var(--hybrid-tabs-content-background-color, #fff);
    border-top: var(--hybrid-tabs-content-background-color, 1px solid #ccc);
  }
  .right-align > .tab-labels {
    flex-direction: var(--hybrid-tabs-right-align-labels-flex-direction, row-reverse);
    align-self: var(--hybrid-tabs-right-align-labels-align-self, end);
  }

  .center-align > .tab-labels {
    align-self: var(--hybrid-tabs-center-align-labels-align-self, center);
  }
  .vertical-align {
    flex-direction: var(--hybrid-tabs-vertical-align-flex-direction, row);
  }
  .horizontal-align {
    flex-direction: var(--hybrid-tabs-halign-flex-direction, column);
  }

  .vertical-align.right-align {
    flex-direction: var(--hybrid-tabs-valign-right-align-flex-direction, row-reverse);
  }

  .tab-label:hover,
  .tab-label.active {
    border-bottom: var(--hybrid-tabs-label-active-border-bottom, 2px solid transparent);
    border-color: var(--hybrid-tabs-label-active-border-color, rgb(0, 106, 254));
  }

  .tab-label.active {
    color: var(--hybrid-tabs-label-active-hover-color, #006afe);
  }

  .vertical-align .tab-label {
    border: var(--hybrid-tabs-vertical-align-label-border, #006afe);
    border-right: var(--hybrid-tabs-vertical-align-label-border-right, 2px solid transparent);
  }

  .vertical-align.right-align .tab-label {
    border: var(--hybrid-tabs-valign-ralign-label-border, none);
    border-left: var(--hybrid-tabs-valign-ralign-label-border-left, 2px solid transparent);
  }

  .vertical-align .tab-label:hover,
  .vertical-align .tab-label.active {
    border: var(--hybrid-tabs-vertical-align-label-border-active, none);
    border-right: var(--hybrid-tabs-vertical-align-label-border-right-active, 2px solid transparent);
    border-color: var(--hybrid-tabs-vertical-align-label-border-color-active, rgb(0, 106, 254));
  }
  .vertical-align.right-align .tab-label:hover,
  .vertical-align.right-align .tab-label.active {
    border: var(--hybrid-tabs-valign-ralign-label-border-active, none);
    border-left: var(--hybrid-tabs-valign-ralign-label-border-left-active, 2px solid transparent);
    border-color: var(--hybrid-tabs-valign-ralign-label-border-color-active, rgb(0, 106, 254));
  }

  .close-icon {
    font-size: var(--hybrid-tabs-add-icon-font-size, 13px);
  }

  .add-tab-label {
    font-size: var(--hybrid-tabs-add-label-font-size, 13px);
    text-align: var(--hybrid-tabs-add-label-text-align, center);
  }
  .dragging {
    border: var(--hybrid-tabs-dragging-border, 1px dashed gray) !important;
    opacity: 0.8;
    color: #464646 !important;
  }
`;
