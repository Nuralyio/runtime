import {getDayDetails, getNumberOfDays} from './day.helper.js';

export const months = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];
export const getMonthDetails = (
  year: number,
  month: number,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  reminders: any
) => {
  const firstDay = new Date(year, month).getDay();
  const numberOfDays = getNumberOfDays(year, month);
  const monthArray = [];
  let currentDay = null;
  let index = 0;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const reminderMap: any = {};

  for (const idx in reminders) {
    const tempDate = new Date(reminders[idx].timestamp);
    const startOfTheDay = new Date(tempDate.getFullYear(), tempDate.getMonth(), tempDate.getDate()).getTime();
    reminderMap[startOfTheDay] = reminders[idx];
  }

  for (let row = 0; row < 6; row++) {
    for (let col = 0; col < 7; col++) {
      currentDay = getDayDetails({
        index,
        numberOfDays,
        firstDay,
        year,
        month,
        reminders: reminderMap,
      });
      monthArray.push(currentDay);
      index++;
    }
  }
  return monthArray;
};
