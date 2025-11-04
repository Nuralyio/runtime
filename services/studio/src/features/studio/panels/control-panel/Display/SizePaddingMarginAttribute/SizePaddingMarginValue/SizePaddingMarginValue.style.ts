import { css } from "lit";

export default css`
  nr-input {
    --nuraly-input-container-border-color: transparent;
   --nuraly-input-medium-padding-top: 0px;
   --nuraly-input-medium-padding-bottom: 0px;
   --nuraly-input-medium-padding-left: 0px;
   --nuraly-input-medium-padding-right: 0px;
        padding-top: var(--nuraly-input-medium-padding-top, var(--nuraly-input-local-medium-padding-top));

    --nuraly-input-text-align: center;
  }

  .margin-label,
  .padding-label {
    color: #ccc;
    margin-bottom: 14px;
  }

  .container-outside {
    width: 210px;
    background-color: #393939;
    padding: 50px;
    border-radius: 3px;
    padding-top: 5px;
    padding-bottom: 35px;
	  margin-right: 10px;
    position: relative;
  }

  .position-input {
    width: 40px;
  }

  .container-outside > .margin-left,
  .container-outside > .margin-right,
  .container-outside > .margin-top,
  .container-outside > .margin-bottom {
    position: absolute;
    color: #ccc;
  }

  .margin-left {
    left: 10px;
    top: 50%;
    transform: translateY(-40%);
  }

  .margin-right {
    right: 5px;
    top: 50%;
    transform: translateY(-40%);
  }

  .margin-top {
    top: 15px;
    left: 50%;
    transform: translateX(-50%);
  }

  .margin-bottom {
    bottom: 15px;
    left: 50%;
    transform: translateX(-50%);
  }

  .container {
    width: 200px;
    height: 85px;
    border: 1px solid #bcbcbc;
    border-radius: 3px;
    padding: 5px;
    position: relative;
  }

  .container > .padding-left {
    position: absolute;
    top: 40%;
    left: 0;
  }

  .container > .padding-right {
    position: absolute;
    top: 40%;
    right: 0;
  }

  .container > .padding-top {
    position: absolute;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
  }

  .container > .padding-bottom {
    position: absolute;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
  }

  .input-group {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 300px;
    margin: 10px;
  }
`;
