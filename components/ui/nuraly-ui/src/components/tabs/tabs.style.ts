import {css} from 'lit';

export const styles = css`
  .tabs-container {
    display: flex;
    /*box-shadow: var(
      --hybrid-dropdown-box-shadow,
      rgba(0, 0, 0, 0.11) 0px 0.3px 0.9px,
      rgba(0, 0, 0, 0.11) 0px 1.6px 3.6px
    );*/
  }

  .vertical-align > .tab-content {
    border: none;
    border-left: 1px solid #ccc;
  }
  .vertical-align.right-align > .tab-content {
    border: none;
    border-right: 1px solid #ccc;
  }

  .tab-labels {
    display: flex;
  }

  .tab-label {
    cursor: pointer;
    padding: 7px 7px 5px 7px;
    border-bottom: 2px solid transparent;
    transition: border-color 0.1s ease;
    user-select: none;
  }

  .tab-label:hover {
    color: var(--hybrid-button-active-border-color, #1661b1);
  }

  .tab-label.active {
    color: var(--hybrid-button-hover-color, #006afe);
  }

  .tab-content {
    padding: 10px;
    flex-grow: 1;
    background-color: #fff;
    border-top: 1px solid #ccc;
  }
  .right-align > .tab-labels {
    flex-direction: row-reverse;
  }

  .right-align > .tab-labels {
    align-self: end;
  }
  .center-align > .tab-labels {
    align-self: center;
  }
  .vertical-align {
    flex-direction: row;
  }
  .horizontal-align {
    flex-direction: column;
  }

  .vertical-align.right-align {
    flex-direction: row-reverse;
  }

  .tab-label:hover,
  .tab-label.active {
    border-bottom: 2px solid transparent;
    border-color: rgb(0, 106, 254);
  }

  .vertical-align .tab-label {
    border: none;
    border-right: 2px solid transparent;
  }

  .vertical-align.right-align .tab-label {
    border: none;
    border-left: 2px solid transparent;
  }

  .vertical-align .tab-label:hover,
  .vertical-align .tab-label.active {
    border: none;
    border-right: 2px solid transparent;
    border-color: rgb(0, 106, 254);
  }
  .vertical-align.right-align .tab-label:hover,
  .vertical-align.right-align .tab-label.active {
    border: none;
    border-left: 2px solid transparent;
    border-color: rgb(0, 106, 254);
  }
`;
