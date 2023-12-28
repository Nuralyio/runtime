import {css} from 'lit';

const dropdwonStyle = css`
  .menu {
    position: relative;
    display: inline-block;
  }
  .menu-content {
    min-width: var(--hybrid-menu-min-width, 250px);
    z-index: var(--hybrid-menu-z-index, 400);
    border-radius: var(--hybrid-button-border-radius, 0.25rem);
    border-width: var(--hybrid-button-border-width, 1px);
    border-color: var(--hybrid-button-border-color, #cfcfcf);
    padding: 5px;
    border-style: solid;
    background-color: var(--hybrid-menu-background-color, #fff);
    background-clip: padding-box;
  }
  .menu-content ul {
    background-color: var(--hybrid-menu-background-color, #fff);
    list-style: none;
    padding: 0;
    margin: 0;
  }
  .menu-content ul li {
    padding: var(--hybrid-menu-item-padding, 12px 16px);
    cursor: var(--hybrid-menu-item-cursor, pointer);
  }

  .nested {
    padding-left: 5px !important;
    padding-top: 5px !important;
  }

  .block {
    margin: 0px 3px;
    // ensure space between praent and childrens
    margin: var(--hybrid-menu-item-margin, 12px 16px);
    box-shadow: var(
      --hybrid-menu-item-shadow,
      0 6px 8px 0 rgba(0, 0, 0, 0.08),
      0 3px 3px -4px rgba(0, 0, 0, 0.12),
      0 9px 9px 4px rgba(0, 0, 0, 0.05)
    );
  }

  .menu-content ul li:not(.group-element):hover {
    //background-color: var(--hybrid-menu-item-hover-background-color, #ddd);
  }
  .menu-content ul li:hover > .nested {
    //display: block;
  }

  .nested-search {
    display: block;
  }

  .menu-content.show {
    display: block;
    opacity: 1;
  }

  .selected {
    width: 93%;
    // background-color: var(--hybrid-menu-item-selected-background-color, #ddd);
  }
  .has-childrens {
    color: var(--hybrid-menu-chilrends-arrow-icon-color, #444444);
    margin: var(--hybrid-menu-chilrends-arrow-icon-margin, 0 6px 0 0);
    float: var(--hybrid-menu-chilrends-arrow-icon-floating, left);
  }

  .carret-boundery-right {
    transform: rotateZ(-180deg);
    float: left;
    margin-right: 20px;
  }
  @keyframes bounce {
    0%,
    100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-10px);
    }
  }
  .arrow-container {
    margin-top: 9px;
    float: left;
    margin-right: -50px;
    transform: rotateZ(-180deg);
  }
  .arrow {
    display: inline-block;
    width: 20px;
    height: 20px;
    transform: rotate(45deg);
    animation: bounce 1s infinite;
  }
  .menu-content ul li.divider {
    height: 1px;
    padding: 0px;
    margin: 0px;
    background-color: rgb(219 219 219);
  }

  .menu-content ul .group-element {
    padding: 7px 0 0 0;
  }

  .menu-content ul li span.group-label {
    color: #555555d4;
    font-weight: 700;
    margin: 15px;
  }
  .nested-group > div.block {
    padding: 0%;
    margin: 0%;
    box-shadow: none;
  }
  .nested-group > div.block > li {
    padding-left: 25px;
  }
  .nested li {
    //  width: 100%;
  }
  /* 
  .menu-item.isSelected,.selected > .group-label {
    */
  .menu-item.isSelected {
    color: var(--hybrid-menu-item-selected-color, #006afe);
  }
`;
export const styles = [dropdwonStyle];
