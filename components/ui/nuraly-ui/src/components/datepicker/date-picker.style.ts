import {css} from 'lit';

const calendarContainerStyles = css`
  :host {
    font-family: -apple-system, BlinkMacSystemFont, segoe ui, Roboto, helvetica neue, Arial,
      noto sans, sans-serif, apple color emoji, segoe ui emoji, segoe ui symbol, noto color emoji;
  }
  .calendar-container {
    z-index: 10000;
    margin-top: 2px;
    user-select: none;
    border-radius: var(--hybrid-button-border-radius, 0.25rem);
    border-width: var(--hybrid-button-border-width, 1px);
    border-color: var(--hybrid-button-border-color, #1677ff);
    padding: 5px;
    border-style: solid;
    height: 270px;
    width: 290px;
    float: left;
    text-align: center;
    position: absolute;
    background-color: white;
  }

  .header-month-year-sepration {
    font-size: 11px;
  }

  .header-next-button {
    float: right;
  }

  .header-prev-button {
    float: left;
  }
`;

const dayStyles = css`
  .days-container {
    display: flex;
    flex-grow: 1;
    flex-wrap: wrap;
  }

  .day-container,
  .day-header-item {
    width: 12.6%;
    height: 30px;
    vertical-align: middle;
    text-align: center;
    font-size: 11px;
    font-weight: 300px;
    color: black;
    border-radius: 1%;
    margin: 2px;
    cursor: pointer;
    line-height: 2.5;
    display: inline-block;
  }
  .day-container:hover,
  .day-active {
    background-color: var(--hybrid-button-hover-border-color, #e4e4e4);
  }

  .day-header-item {
    cursor: auto;
  }
  .day-invalid {
    color: #9a9a9a;
  }
  .day-invalid:hover {
    background-color: #e6e6e6;
    color: var(--hybrid-button-hover-color, #000);
  }
  .year-month-header {
    display: inline-block;
    line-height: 2;
  }
`;
const monthsStyle = css`
  .months-container {
    display: flex;
    flex-grow: 1;
    flex-wrap: wrap;
  }

  .month-container {
    width: 33%;
    height: 37%;
    vertical-align: middle;
    text-align: center;
    line-height: 4.3;
    cursor: pointer;
    font-weight: 300;
    font-size: 14px;
  }
  .month-container:hover,
  .month-active {
    background-color: var(--hybrid-button-hover-border-color, #e4e4e4);
  }
`;

const yearsStyle = css`
  .years-container {
    display: flex;
    flex-grow: 1;
    flex-wrap: wrap;
  }

  .year-container {
    width: 33%;
    height: 37%;
    vertical-align: middle;
    text-align: center;
    line-height: 4.3;
    cursor: pointer;
    font-weight: 300;
    font-size: 14px;
  }
  .year-container:hover,
  .year-active {
    background-color: var(--hybrid-button-hover-border-color, #e4e4e4);
  }
`;
export const styles = [dayStyles, calendarContainerStyles, monthsStyle, yearsStyle, css``];
