import { css } from "lit";

export default css`
:host {
      display: inline-block;
    }
    div {
      display: flex;
      align-items: center;
      cursor: pointer;
    }
    div.disabled {
      opacity: 0.5;
      cursor: auto;
    }
    .checkbox {
      display: flex;
      background-color: var(--hy-checkbox-checked-color, #30a030);
      border-radius: 4px;
      width: var(--hy-checkbox-size, 20px);
      height: var(--hy-checkbox-size, 20px);
      line-height: 0;
      align-items: center;
      justify-content: center;
    }
    .isUnchecked {
      background-color: var(--hy-checkbox-unchecked-color, #ccc);
    }
    path[fill="none"], .checked path[fill="none"] {
      fill: transparent;
    }
    path {
      fill: var(--hy-checkbox-fill-color, #fff);
    }
    .checked path {
      fill: var(--hy-checkbox-unchecked-fill-color, #fff);
    }
    svg {
      width: var(--hy-checkbox-size, 20px);
      height: var(--hy-checkbox-size, 20px);
      line-height: var(--hy-checkbox-size, 20px);
    }
    .label {
      margin-left: 10px;
      font-weight: var(--hy-checkbox-font-weight, normal);
      color: var(--hy-checkbox-label-color, #303030);
    }
    .disabled .label{
      color: var(--hy-checkbox-label-disabled-color, #303030);
    }

    @media (prefers-color-scheme: dark) {
      .label {
         color: var(--hy-checkbox-label-color, #fff);
      }
      path{
        fill: #191515;
      }
      .checkbox {
        --hy-checkbox-checked-color : #00ccff;
      }

  }
`;