import { css } from "lit";

export default css`
  .container {
    display: flex;
    flex-direction: row;
  }
  .first_column {
    width: 30%;
  }
  .last_column {
    width: 35px;
  }
  .unit {
    margin: 3px 0 0 10px;
  }
  .has-smart-attribute {
    position: absolute;
    background-color: red;
    z-index: 999;
  }

  .redo{
    cursor: pointer;
  }
`;
