import { css } from "lit";

export default css`
  :host{
  }
    .container {
      --container-bg-color-local : var(--container-bg-color);

    display: flex;
    width: fit-content;
    min-height: 300px;
    flex-wrap: wrap;
    background-color: var(--container-bg-color-local, var(--container-bg-color));
  }
  .drag-over {
  }

  .drop-zone {
    width: 50px;
    height: 100%;
    display: none;
    border: 2px dashed rgb(110 110 110);
    border-color: #94a3b8;
    background-color: #f8fafc;
    z-index: -4;
    min-height: 100px;
  }
  .drop-zone::before {
        content: "Drop inside the container";
        top: 37%;
        left: 33%;
        transform: translate(-50%, -50%);
        color: #64748b;
        font-size: 0.8rem;
        font-weight: 500;
        transition: opacity 0.2s ease;
        white-space: nowrap;
        position:relative
      }
  .drop-zone-end-of-container-vertical {
    margin-top: auto;
  }
  .drop-zone-end-of-container-horizontal {
    margin-left: auto;
  }
  .vertical {
    flex-direction: column;
  }
  .empty-message-container {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height:100%
  }

  @media (prefers-color-scheme: dark) {
    .container {
    --container-bg-color-local: var(--container-dark-bg-color,  var(--container-bg-color));
  }
}

`;
