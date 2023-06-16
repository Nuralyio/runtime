import {css} from 'lit';

export const styles = css`
  .tooltip {
    top: 0px;
    position: absolute;
    padding: 4px 8px;
    background-color: #000;
    color: #fff;
    border-radius: 4px;
    font-size: 14px;
  }

  .tooltip.top::after {
    content: '';
    position: absolute;
    top: -8px;
    left: 50%;
    transform: translateX(-50%);
    border-width: 8px 8px 0;
    border-style: solid;
    border-color: #000 transparent transparent transparent;
  }

  .tooltip.bottom::before {
    content: '';
    position: absolute;
    bottom: -8px;
    left: 50%;
    transform: translateX(-50%);
    border-width: 0 8px 8px;
    border-style: solid;
    border-color: transparent transparent #000 transparent;
  }

  .tooltip.left::after {
    content: '';
    position: absolute;
    top: 50%;
    left: -8px;
    transform: translateY(-50%);
    border-width: 8px 0 8px 8px;
    border-style: solid;
    border-color: transparent transparent transparent #000;
  }

  .tooltip.right::after {
    content: '';
    position: absolute;
    top: 50%;
    right: -8px;
    transform: translateY(-50%);
    border-width: 8px 8px 8px 0;
    border-style: solid;
    border-color: transparent #000 transparent transparent;
  }

  .tooltip.corner-left::after {
    content: '';
    position: absolute;
    top: 0;
    left: -8px;
    border-width: 8px 0 8px 8px;
    border-style: solid;
    border-color: transparent transparent transparent #000;
  }

  .tooltip.corner-right::after {
    content: '';
    position: absolute;
    top: 0;
    right: -8px;
    border-width: 8px 8px 8px 0;
    border-style: solid;
    border-color: transparent #000 transparent transparent;
  }
`;
