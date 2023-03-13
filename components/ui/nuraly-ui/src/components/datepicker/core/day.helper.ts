const daysMap = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getDayDetails = (args: any) => {
  const date = args.index - args.firstDay;
  const day = args.index % 7;
  let prevMonth = args.month - 1;
  let prevYear = args.year;
  if (prevMonth < 0) {
    prevMonth = 11;
    prevYear--;
  }
  const prevMonthNumberOfDays = getNumberOfDays(prevYear, prevMonth);
  const _date =
    (date < 0 ? prevMonthNumberOfDays + date : date % args.numberOfDays) + 1;
  const valid = date >= 0 && date < args.numberOfDays ? 1 : 0;
  const timestamp = new Date(args.year, args.month, _date).getTime();
  return {
    date: _date,
    day,
    valid,
    timestamp,
    dayString: daysMap[day],
    reminder: args.reminders[timestamp] || null,
  };
};

export const getNumberOfDays = (year: number, month: number) => {
  return 32 - new Date(year, month, 32).getDate();
};
