import {DateRawObject, IDayInfo, IDayPresentation} from '../datepicker.types.js';

export const getDayDetails = ({dayIndex, month, year, numberOfDays, firstDay, days}: IDayInfo): IDayPresentation => {
  const date = dayIndex - firstDay;
  const day = dayIndex % 7;
  let prevMonth = month - 1;
  let prevYear = year;
  if (prevMonth < 0) {
    prevMonth = 11;
    prevYear--;
  }
  const prevMonthNumberOfDays = getNumberOfDays(prevYear, prevMonth);
  const _date = (date < 0 ? prevMonthNumberOfDays + date : date % numberOfDays) + 1;
  const valid = date >= 0 && date < numberOfDays ? 1 : 0;
  const timestamp = new Date(year, month, _date).getTime();
  let _month = month;
  let _year = year;
  if (date > 0 && date >= numberOfDays) {
    _month += 1;
    if (_month > 11) {
      _month = 0;
      _year++;
    }
  } else if (date < 0) {
    _month -= 1;
    if (_month < 0) {
      _month = 11;
      _year--;
    }
  }
  return {
    date: _date,
    day,
    valid,
    timestamp,
    dayString: days[day],
    month: _month,
    year: _year,
  };
};

export const getNumberOfDays = (year: number, month: number) => {
  return 32 - new Date(year, month, 32).getDate();
};

export const todayIsTheDay = (day: IDayPresentation, dateRawObject: DateRawObject, isRange: boolean): boolean => {
  let isTheDate = false;
  if (!isRange) {
    isTheDate =
      day.year === dateRawObject.curentYear &&
      dateRawObject.currentMonth === day.month + 1 &&
      day.date === dateRawObject.currentDay;
  }

  return isTheDate;
};
