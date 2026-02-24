import { css } from "lit";

export const formStyles = css`
  :host {
    display: block;
    width: 100%;
  }

  .form-placeholder {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: #64748b;
    min-height: 200px;
    width: 100%;
    border-radius: 8px;
    border: 2px dashed #cbd5e1;
    gap: 12px;
    cursor: pointer;
  }

  .form-placeholder nr-icon {
    --nuraly-icon-size: 48px;
  }
`;
