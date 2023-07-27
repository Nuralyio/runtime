import {css} from 'lit';

const dropdwonStyle = css`
  * {
    font-family: var(--hybrid-dropdown-fonts, Arial, sans-serif);
  }
  .dropdown {
    position: relative;
    display: inline-block;
  }
  .dropdown-content {
    display: none;
    position: absolute;
    min-width: var(--hybrid-dropdown-min-width, 180px);
    z-index: var(--hybrid-dropdown-z-index, 400);
    box-shadow: var(
      --hybrid-dropdown-box-shadow,
      0 6px 8px 0 rgba(0, 0, 0, 0.08),
      0 3px 3px -4px rgba(0, 0, 0, 0.12),
      0 9px 9px 4px rgba(0, 0, 0, 0.05)
    );
    background-color: var(--hybrid-dropdown-background-color, #fff);
    background-clip: padding-box;
    border-radius: var(--hybrid-dropdown-border-radius, 8px);
  }
  .dropdown-content ul {
    background-color: var(--hybrid-dropdown-background-color, #fff);
    list-style: none;
    padding: 0;
    margin: 0;
  }
  .dropdown-content ul li {
    padding: var(--hybrid-dropdown-item-padding, 12px 16px);
    cursor: var(--hybrid-dropdown-item-cursor, pointer);
  }

  .nested {
    display: none;
    position: absolute;
    left: 100%;
    width: 100%;
    top: 0;
  }

  .block {
    margin: 0px 3px;
    // ensure space between praent and childrens
    margin: var(--hybrid-dropdown-item-margin, 12px 16px);
    box-shadow: var(
      --hybrid-dropdown-item-shadow,
      0 6px 8px 0 rgba(0, 0, 0, 0.08),
      0 3px 3px -4px rgba(0, 0, 0, 0.12),
      0 9px 9px 4px rgba(0, 0, 0, 0.05)
    );
  }

  .dropdown-content ul li:not(.group-element):hover {
    background-color: var(--hybrid-dropdown-item-hover-background-color, #ddd);
  }
  .dropdown-content ul li:hover > .nested {
    //display: block;
  }

  .nested-search {
    display: block;
  }

  .dropdown-content.show {
    display: block;
    opacity: 1;
  }

  .selected {
    background-color: var(--hybrid-dropdown-item-selected-background-color, #ddd);
  }
  .has-childrens {
    color: var(--hybrid-dropdown-chilrends-arrow-icon-color, #444444);
    margin: var(--hybrid-dropdown-chilrends-arrow-icon-margin, 0 6px 0 0);
    float: var(--hybrid-dropdown-chilrends-arrow-icon-floating, right);
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
    float: right;
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
  .dropdown-content ul li.divider {
    height: 1px;
    padding: 0px;
    margin: 0px;
    background-color: rgb(219 219 219);
  }

  .dropdown-content ul .group-element {
    padding: 7px 0 0 0;
  }

  .dropdown-content ul li span.group-label {
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
`;
export const styles = [dropdwonStyle];
