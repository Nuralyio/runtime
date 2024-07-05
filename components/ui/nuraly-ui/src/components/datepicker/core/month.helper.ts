import {getDayDetails, getNumberOfDays} from './day.helper';
import {IDayPresentation} from '../datepicker.types';

export const getMonthDetails = (year: number, month: number, days: string[]) => {
  const firstDay = new Date(year, month).getDay();
  const numberOfDays = getNumberOfDays(year, month);
  const monthArray: IDayPresentation[] = [];
  let currentDay: IDayPresentation;
  let index = 0;

  for (let row = 0; row < 6; row++) {
    for (let col = 0; col < 7; col++) {
      currentDay = getDayDetails({
        dayIndex: index,
        numberOfDays,
        firstDay,
        year,
        month,
        days,
      });
      monthArray.push(currentDay);
      index++;
    }
  }
  return monthArray;
};
