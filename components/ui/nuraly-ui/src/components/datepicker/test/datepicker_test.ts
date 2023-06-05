/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */

import {HyDatePickerElement} from '../date-picker.component';
import {fixture, html, expect, oneEvent} from '@open-wc/testing';
import {Mode} from '../constants';

/*const button = el.shadowRoot!.querySelector('button')!;
    assert.equal(getComputedStyle(button).borderColor, '16px');*/

// TODO: all colors assertion are disabled until they get validated.
suite('HyDatePickerElement', () => {
  test('should instantiate the component', async () => {
    const el = await fixture<HyDatePickerElement>(html`<hy-datepicker></hy-datepicker>`);
    expect(el).to.be.instanceOf(HyDatePickerElement);
  });

  test('should toggle the calendar on click', async () => {
    const el = await fixture<HyDatePickerElement>(html`<hy-datepicker></hy-datepicker>`);
    const icon = el.shadowRoot!.querySelector<HTMLElement>('hy-icon[slot="suffix"]')!;
    icon.click();
    expect(el.openedCalender).to.be.true;
  });
  test('should update dateValue on input change', async () => {
    const el = await fixture<HyDatePickerElement>(html`<hy-datepicker></hy-datepicker>`);
    const input = el.shadowRoot!.querySelector<HTMLElement>('hy-input')!;
    const newDate = '2023-03-20';
    setTimeout(() => {
      input.dispatchEvent(
        new CustomEvent('valueChange', {
          detail: {value: newDate},
          bubbles: true,
          composed: true,
        })
      );
    });
    const {detail} = await oneEvent(input, 'valueChange');
    el.dateValue = detail.value;
    expect(el.dateValue).to.equal(newDate);
  });
  test('should update locale and change month and weekdays', async () => {
    const el = await fixture<HyDatePickerElement>(html`<hy-datepicker></hy-datepicker>`);
    const initialMonths = el.months;
    const initialWeekdays = el.weekdaysShort;
    el.locale = 'fr';
    await el.updateComplete;
    expect(el.months).to.not.deep.equal(initialMonths);
    expect(el.weekdaysShort).to.not.deep.equal(initialWeekdays);
  });

  test('should render calendar when openedCalender is true', async () => {
    const el = await fixture<HyDatePickerElement>(html`<hy-datepicker .openedCalender=${true}></hy-datepicker>`);
    const calendarContainer = el.shadowRoot!.querySelector('.calendar-container');
    expect(calendarContainer).to.exist;
  });
  test('should not render calendar when openedCalender is false', async () => {
    const el = await fixture<HyDatePickerElement>(html`<hy-datepicker></hy-datepicker>`);
    const calendarContainer = el.shadowRoot!.querySelector('.calendar-container');
    expect(calendarContainer).to.not.exist;
  });
  test('should change the month on next and prev buttons click', async () => {
    const el = await fixture<HyDatePickerElement>(html`<hy-datepicker .openedCalender=${true}></hy-datepicker>`);
    const prevMonth = el.navigationDates.start.month;
    const prevButton = el.shadowRoot!.querySelector('.prev-month') as HTMLElement;
    const nextButton = el.shadowRoot!.querySelector('.next-month') as HTMLElement;

    prevButton.click();
    await el.updateComplete;
    expect(el.navigationDates.start.month).to.not.equal(prevMonth);

    nextButton.click();
    await el.updateComplete;
    expect(el.navigationDates.start.month).to.equal(prevMonth);
  });
  test('should change the year on next and prev year buttons click', async () => {
    const el = await fixture<HyDatePickerElement>(html`<hy-datepicker .openedCalender=${true}></hy-datepicker>`);
    const prevYear = el.navigationDates.start.year;
    const prevYearButton = el.shadowRoot!.querySelector('.prev-year') as HTMLElement;
    const nextYearButton = el.shadowRoot!.querySelector('.next-year') as HTMLElement;

    await el.updateComplete;
    prevYearButton.click();
    await el.updateComplete;
    expect(el.navigationDates.start.year).to.not.equal(prevYear);
    nextYearButton.click();
    await el.updateComplete;
    expect(el.navigationDates.start.year).to.equal(prevYear);
  });
  test('should toggle year view on year header button click', async () => {
    const el = await fixture<HyDatePickerElement>(html`<hy-datepicker .openedCalender=${true}></hy-datepicker>`);
    const yearHeaderButton = el.shadowRoot!.querySelector('.toggle-year-view') as HTMLElement;

    yearHeaderButton.click();
    await el.updateComplete;
    expect(el.prevMode).to.equal(Mode.Year);
  });

  test('should select a month when a month is clicked', async () => {
    const el = await fixture<HyDatePickerElement>(
      html`<hy-datepicker .mode=${Mode.Month} .openedCalender=${true}></hy-datepicker>`
    );
    await el.updateComplete;

    const monthButton = el.shadowRoot!.querySelector('.month-container') as HTMLElement;
    monthButton.click();
    await el.updateComplete;
    expect(el.currentMonth).to.equal(1);
  });
  test('should select a year when a year is clicked', async () => {
    const el = await fixture<HyDatePickerElement>(
      html`<hy-datepicker .mode=${Mode.Year} .openedCalender=${true}></hy-datepicker>`
    );
    await el.updateComplete;
    const yearButton = el.shadowRoot!.querySelector('.year-container') as HTMLElement;
    yearButton.click();
    await el.updateComplete;
    expect(el.curentYear).to.equal(Number(yearButton.textContent));
  });
});
