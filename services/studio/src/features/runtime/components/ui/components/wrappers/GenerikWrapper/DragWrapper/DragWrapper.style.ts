import { css } from "lit";

export default css`
  .drop-zone {
    display: none;
    border: 2px dashed rgb(110 110 110);
    z-index: -4;
    color :red
  }
  .drop-zone.before {
    background-color:aliceblue
  }
  .drop-zone.after {
    background-color: antiquewhite
  }
  
`;
