import { expect, fixture, html } from '@open-wc/testing';
import '../datepicker.component';
import { HyDatePickerElement } from '../datepicker.component';
import { DatePickerMode } from '../datepicker.types';

suite('HyDatePickerElement', () => {
  test('should be defined', async () => {
    const el = await fixture<HyDatePickerElement>(html`<nr-datepicker></nr-datepicker>`);
    expect(el).to.be.instanceOf(HyDatePickerElement);
  });

  test('should open the calendar when input is focused', async () => {
    const el = await fixture<HyDatePickerElement>(html`<nr-datepicker></nr-datepicker>`);
    const input = el.shadowRoot!.querySelector('nr-input');
    input!.dispatchEvent(new Event('focus'));
    expect(el.openedCalendar).to.be.true;
  });

  test('should close the calendar when clicking outside', async () => {
    const el = await fixture<HyDatePickerElement>(html`<nr-datepicker></nr-datepicker>`);
    el.openedCalendar = true;
    document.body.click();
    expect(el.openedCalendar).to.be.false;
  });

  test('should move to next month', async () => {
    const el = await fixture<HyDatePickerElement>(html`<nr-datepicker></nr-datepicker>`);
    const currentMonth = 1;
    el.navigationDates = {start: {month: currentMonth, day: 1, year: 2023}};
    el.openedCalendar = true;
    await el.updateComplete;
    const nextMonthButton = el.shadowRoot?.querySelector('.next-month') as HTMLButtonElement;
    nextMonthButton!.click();
    expect(el.navigationDates.start.month).to.equal(currentMonth + 1);
  });
  test('should move to previous month', async () => {
    const el = await fixture<HyDatePickerElement>(html`<nr-datepicker></nr-datepicker>`);
    const currentMonth = 2;
    el.navigationDates = {start: {month: currentMonth, day: 1, year: 2023}};
    el.openedCalendar = true;
    await el.updateComplete;
    const previousMonthButton = el.shadowRoot?.querySelector('.prev-month') as HTMLButtonElement;
    previousMonthButton!.click();
    expect(el.navigationDates.start.month).to.equal(currentMonth - 1);
  });
  test('should move to next year when displaying last month and click next month', async () => {
    const el = await fixture<HyDatePickerElement>(html`<nr-datepicker></nr-datepicker>`);
    const currentYear = 2023;
    el.navigationDates = {start: {month: 12, day: 1, year: currentYear}};
    el.openedCalendar = true;
    await el.updateComplete;
    const nextMonthButton = el.shadowRoot?.querySelector('.next-month') as HTMLButtonElement;
    nextMonthButton!.click();
    expect(el.navigationDates.start.month).to.equal(1);
    expect(el.navigationDates.start.year).to.equal(currentYear + 1);
  });

  test('should move to previous year when displaying first month and click next month', async () => {
    const el = await fixture<HyDatePickerElement>(html`<nr-datepicker></nr-datepicker>`);
    const currentYear = 2023;
    el.navigationDates = {start: {month: 1, day: 1, year: currentYear}};
    el.openedCalendar = true;
    await el.updateComplete;
    const previousMonthButton = el.shadowRoot?.querySelector('.prev-month') as HTMLButtonElement;
    previousMonthButton!.click();
    expect(el.navigationDates.start.month).to.equal(12);
    expect(el.navigationDates.start.year).to.equal(currentYear - 1);
  });

  test('should move to previous year', async () => {
    const el = await fixture<HyDatePickerElement>(html`<nr-datepicker></nr-datepicker>`);
    const currentYear = 2023;
    el.navigationDates = {start: {month: 2, day: 1, year: currentYear}};
    el.openedCalendar = true;
    await el.updateComplete;
    const previousYearButton = el.shadowRoot?.querySelector('.previous-year') as HTMLButtonElement;
    previousYearButton!.click();
    expect(el.navigationDates.start.year).to.equal(currentYear - 1);
  });
  test('should move to next year', async () => {
    const el = await fixture<HyDatePickerElement>(html`<nr-datepicker></nr-datepicker>`);
    const currentyear = 2023;
    el.navigationDates = {start: {month: 2, day: 1, year: currentyear}};
    el.openedCalendar = true;
    await el.updateComplete;
    const nextYearButton = el.shadowRoot?.querySelector('.next-year') as HTMLButtonElement;
    nextYearButton!.click();
    expect(el.navigationDates.start.year).to.equal(currentyear + 1);
  });
  test('should select a date correctly', async () => {
    const el = await fixture<HyDatePickerElement>(html`<nr-datepicker></nr-datepicker>`);
    el.navigationDates = {start: {month: 2, day: 20, year: 2023}};
    el.openedCalendar = true;
    await el.updateComplete;
    const days = el.shadowRoot!.querySelectorAll('.day-container:not(.day-invalid)')!;
    const dayInTheMonth = 2;
    (days[dayInTheMonth] as HTMLElement).click();
    await el.updateComplete;
    // Access the input field value through the input element instead of private property
    const input = el.shadowRoot!.querySelector('hy-input') as any;
    expect(input.value).to.equal(`03/02/2023`);
  });
  test('should select a month correctly', async () => {
    const el = await fixture<HyDatePickerElement>(html`<nr-datepicker></nr-datepicker>`);
    el.openedCalendar = true;
    el.mode = DatePickerMode.Month;
    await el.updateComplete;
    const months = el.shadowRoot!.querySelectorAll('.month-container')!;
    const monthIndex = 1;
    (months[monthIndex] as HTMLElement).click();
    expect(el.navigationDates.start.month).to.equal(monthIndex + 1);
  });
  test('should select a year correctly', async () => {
    const el = await fixture<HyDatePickerElement>(html`<nr-datepicker></nr-datepicker>`);
    el.openedCalendar = true;
    el.mode = DatePickerMode.Year;
    await el.updateComplete;
    const years = el.shadowRoot!.querySelectorAll('.year-container')!;
    const yearIndex = 1;
    (years[yearIndex] as HTMLElement).click();
    const yearValue = years[yearIndex].textContent!;
    expect(el.navigationDates.start.year).to.equal(+yearValue);
  });
});
