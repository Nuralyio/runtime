import { css } from "lit";

export default css`


  /* Placeholder shown when container is empty */
  .container-placeholder {
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
    background: rgba(248, 250, 252, 0.5);
    transition: border-color 0.2s ease, background 0.2s ease;
  }

  .container-placeholder:hover {
    border-color: #94a3b8;
    background: rgba(248, 250, 252, 0.8);
  }

  .container-placeholder nr-icon {
    --nuraly-icon-size: 48px;
    opacity: 0.6;
  }

  .container-placeholder nr-label {
    opacity: 0.8;
  }
`;
