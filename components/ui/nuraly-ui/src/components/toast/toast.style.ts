import { css } from "lit";

export default css`
:host {
  display: flex;
  position: fixed;
  left: 50%;
  transform: translateX(-50%) translateY(-110%); /* Change translateY to -110% to start from the top */
  z-index: var(--lt-z-index, 2);
  top: 0; /* Change from bottom to top */
  background-color: var(--lt-background-color, #292929);
  color: var(--lt-color, #dddddd);
  text-align: center;
  border-radius: var(--lt-border-radius, 2px);
  padding: var(--lt-padding, 16px);
  border: var(--lt-border, none);
  font-size: var(--lt-font-size, 1em);
  font-family: var(--lt-font-family, sans-serif);
}

:host(.show) {
  top: var(--lt-top, 40px); /* Change from bottom to top */
  transform: translateX(-50%);
  -webkit-animation: fadein 0.5s, fadeout 0.5s 2.5s;
  animation: fadein 0.5s, fadeout 0.5s 2.5s;
}

@-webkit-keyframes fadein {
  from {
    top: 0; /* Change from bottom to top */
    transform: translateX(-50%) translateY(-110%); /* Change translateY to -110% to start from the top */
  }
  to {
    top: var(--lt-top, 40px); /* Change from bottom to top */
    transform: translateX(-50%) translateY(0); /* Change translateY to 0 to reach the top */
  }
}

@keyframes fadein {
  from {
    top: 0; /* Change from bottom to top */
    transform: translateX(-50%) translateY(-110%); /* Change translateY to -110% to start from the top */
  }
  to {
    top: var(--lt-top, 40px); /* Change from bottom to top */
    transform: translateX(-50%) translateY(0); /* Change translateY to 0 to reach the top */
  }
}

@-webkit-keyframes fadeout {
  from {
    top: var(--lt-top, 40px); /* Change from bottom to top */
    transform: translateX(-50%) translateY(0); /* Change translateY to 0 to reach the top */
  }
  to {
    top: 0; /* Change from bottom to top */
    transform: translateX(-50%) translateY(-110%); /* Change translateY to -110% to start from the top */
  }
}

@keyframes fadeout {
  from {
    top: var(--lt-top, 40px); /* Change from bottom to top */
    transform: translateX(-50%) translateY(0); /* Change translateY to 0 to reach the top */
  }
  to {
    top: 0; /* Change from bottom to top */
    transform: translateX(-50%) translateY(-110%); /* Change translateY to -110% to start from the top */
  }
}
`;
