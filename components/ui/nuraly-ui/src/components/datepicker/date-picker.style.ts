import {css} from 'lit';

const calendarStyles = css`
  :host {
    font-family: var(--hybrid-datepicker-font-family);
  }
  .calendar-container {
    z-index: 10000;
    user-select: none;
    padding: 5px;
    width: 350px;
    float: left;
    text-align: center;
    position: absolute;
    background-color: var(--hybrid-datepicker-background-color);
  }
  hy-button {
    --hybrid-button-border-top: 1px solid transparent;
    --hybrid-button-border-bottom: 1px solid transparent;
    --hybrid-button-border-left: 1px solid transparent;
    --hybrid-button-border-right: 1px solid transparent;
    --hybrid-button-background-color: var(--hybrid-datepicker-button-background-color);
    --hybrid-button-text-color: var(--hybrid-datepicker-button-text-color);
  }
  .toggle-year-view,
  .toggle-month-view {
    --hybrid-button-font-weight: var(--hybrid-datepicker-toggle-month-year-font-weight);
  }
  .current-year-container {
    display: inline-flex;
    gap: 5px;
  }
  .year-icons-toggler {
    display: none;
    flex-direction: column;
    line-height: 0;
  }
  .next-year,
  .previous-year {
    --hybrid-button-width: 10px;
    --hybrid-button-height: 10px;
    --hybrid-button-padding-x: 0px;
    --hybrid-button-padding-y: 0px;
    --hybrid-button-hover-border-color: transparent;
    --hybrid-button-active-border-color: transparent;
  }
  .calendar-container-range {
    width: 600px;
  }

  .header-next-button {
    float: right;
  }

  .header-prev-button {
    float: left;
  }

  .day-containers {
    display: flex;
    flex-flow: row;
    width: 100%;
  }
  .days-container {
    color: var(--hybrid-datepicker-day-container-color);
    display: flex;
    flex-grow: 1;
    flex-wrap: wrap;
  }

  .day-container,
  .day-header-item {
    width: 13%;
    height: var(--hybrid-datepicker-day-container-height);
    font-size: 13px;
    margin: 2px;
    cursor: pointer;
    line-height: 2.5;
  }

  :host([size='small']) .day-container {
    height: var(--hybrid-datepicker-small-day-container-height);
  }
  :host([size='large']) .day-container {
    height: var(--hybrid-datepicker-large-day-container-height);
  }

  :not(.day-active).day-container:hover {
    background-color: var(--hybrid-datepicker-day-container-hover-background-color);
  }

  .day-active,
  .month-active,
  .year-active {
    background-color: var(--hybrid-datepicker-current-day-month-year-background-color);
    color: var(--hybrid-datepicker-current-day-month-year-color);
  }
  .today {
    position: relative;
  }
  :not(.day-active).today {
    color: var(--hybrid-datepicker-today-color);
  }
  .current-year-container:hover > .year-icons-toggler {
    display: inline-flex;
  }
  .today::after {
    content: '';
    display: block;
    width: 4px;
    height: 4px;
    background-color: var(--hybrid-datepicker-today-underline-color);
    position: absolute;
    top: 75%;
    right: 50%;
    transform: translate(50%);
  }
  .day-header-item {
    cursor: auto;
  }
  .day-invalid {
    color: var(--hybrid-datepicker-day-invalid-color);
  }
  .day-invalid:hover {
    background-color: var(--hybrid-datepicker-day-invalid-hover-background-color);
  }
  .year-month-header {
    display: inline-block;
    line-height: 2;
  }

  .months-container {
    display: flex;
    flex-grow: 1;
    flex-wrap: wrap;
  }

  .month-container {
    width: 33%;
    line-height: var(--hybrid-datepicker-month-container-line-height);
    cursor: pointer;
    font-size: 13px;
  }
  :not(.month-active).month-container:hover {
    background-color: var(--hybrid-datepicker-month-container-hover-background-color);
  }

  :host([size='small']) .month-container {
    line-height: var(--hybrid-datepicker-small-month-container-line-height);
  }
  :host([size='large']) .month-container {
    line-height: var(--hybrid-datepicker-large-month-container-line-height);
  }

  .years-container {
    display: flex;
    flex-grow: 1;
    flex-wrap: wrap;
  }

  .year-container {
    width: 33%;
    line-height: var(--hybrid-datepicker-year-container-line-height);
    cursor: pointer;
    font-size: 13px;
  }
  :not(.year-active).year-container:hover {
    background-color: var(--hybrid-datepicker-year-container-hover-background-color);
  }

  :host([size='small']) .year-container {
    line-height: var(--hybrid-datepicker-small-year-container-line-height);
  }
  :host([size='large']) .year-container {
    line-height: var(--hybrid-datepicker-large-year-container-line-height);
  }
  :host {
    --hybrid-datepicker-font-family: IBM Plex Sans;
    --hybrid-datepicker-background-color: #f9f9f9;
    --hybrid-datepicker-toggle-month-year-font-weight: bold;
    --hybrid-datepicker-button-background-color: #f9f9f9;
    --hybrid-datepicker-button-text-color: #393939;

    --hybrid-datepicker-year-container-line-height: 4.3;
    --hybrid-datepicker-small-year-container-line-height: 3.3;
    --hybrid-datepicker-large-year-container-line-height: 5.3;
    --hybrid-datepicker-year-container-hover-background-color: #e4e4e4;
    --hybrid-datepicker-month-container-line-height: 4.3;
    --hybrid-datepicker-small-month-container-line-height: 3.3;
    --hybrid-datepicker-large-month-container-line-height: 5.3;
    --hybrid-datepicker-month-container-hover-background-color: #e4e4e4;
    --hybrid-datepicker-day-container-height: 30px;
    --hybrid-datepicker-day-container-color: #000000;
    --hybrid-datepicker-small-day-container-height: 25px;
    --hybrid-datepicker-large-day-container-height: 35px;
    --hybrid-datepicker-day-container-hover-background-color: #e4e4e4;
    --hybrid-datepicker-day-invalid-color: #9a9a9a;
    --hybrid-datepicker-day-invalid-hover-background-color: #e6e6e6;
    --hybrid-datepicker-current-day-month-year-background-color: #0f62fe;
    --hybrid-datepicker-current-day-month-year-color: #ffffff;
    --hybrid-datepicker-today-underline-color: #0f62fe;
    --hybrid-datepicker-today-color: #0f62fe;
  }
  @media (prefers-color-scheme: dark) {
    :host {
      --hybrid-datepicker-background-color: #000000;
      --hybrid-datepicker-day-container-color: #ffffff;
      --hybrid-datepicker-button-background-color: #000000;
      --hybrid-datepicker-button-text-color: #ffffff;
      --hybrid-datepicker-day-container-hover-background-color: #393939;
      --hybrid-datepicker-day-invalid-hover-background-color: #393939;
      --hybrid-datepicker-month-container-hover-background-color: #393939;
      --hybrid-datepicker-year-container-hover-background-color: #393939;
    }
  }
`;
export const styles = [calendarStyles];
