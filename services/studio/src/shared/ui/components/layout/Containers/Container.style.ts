import { css } from "lit";

export default css`
  :host{
  }
  .container {
    /* --container-bg-color-local: var(--container-bg-color); */

    display: flex;
    width: fit-content;
    min-height: 300px;
    flex-wrap: wrap;
    /* background-color: var(--container-bg-color-local, var(--container-bg-color)); */
}

.boxed{
  margin-inline-start: auto;
  margin-inline-end: auto;
}
.container > * {
}
  .vertical {
    flex-direction: column;
  }
  .horizontal {
}

.horizontal > * {
}
  .empty-message-container {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height:100%
  }


`;
