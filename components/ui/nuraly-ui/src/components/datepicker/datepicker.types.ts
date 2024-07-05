export enum Mode {
  Day = 'day',
  Month = 'month',
  Year = 'year',
  Decade = 'decade',
}

export interface INavigationDate {
  start: {
    year: number;
    month: number;
    day: number;
  };
}
export interface IDayPresentation {
  date: number;
  day: number;
  dayString: string;
  month: number;
  valid: number;
  year: number;
  timestamp: number;
}

export interface IDayInfo {
  dayIndex: number;
  numberOfDays: number;
  firstDay: number;
  year: number;
  month: number;
  days: string[];
}
export interface DateRawObject {
  curentYear: number;
  currentMonth: number;
  currentDay: number;
  endYear: number;
  endMonth: number;
  endDay: number;
}
