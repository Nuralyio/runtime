/**
 * @license
 * Copyright 2023 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import { html, fixture, expect, aTimeout } from '@open-wc/testing';
import { NrTimePickerElement } from '../timepicker.component.js';
import { TimeFormat, TimePickerSize, TimePickerVariant } from '../timepicker.types.js';

suite('NrTimePickerElement', () => {
  let element: NrTimePickerElement;

  setup(async () => {
    element = await fixture(html`<nr-timepicker></nr-timepicker>`);
  });

  suite('Basic functionality', () => {
    test('should render successfully', () => {
      expect(element).to.exist;
      expect(element.tagName).to.equal('NR-TIMEPICKER');
    });

    test('should have default properties', () => {
      expect(element.format).to.equal(TimeFormat.TwentyFourHour);
      expect(element.showSeconds).to.be.false;
      expect(element.disabled).to.be.false;
      expect(element.readonly).to.be.false;
      expect(element.required).to.be.false;
    });

    test('should have empty initial value', () => {
      expect(element.value).to.equal('');
    });
  });

  suite('Time format handling', () => {
    test('should handle 24-hour format by default', async () => {
      element.value = '14:30';
      await element.updateComplete;
      expect(element.value).to.equal('14:30');
    });

    test('should handle 12-hour format', async () => {
      element.format = TimeFormat.TwelveHour;
      element.value = '2:30 PM';
      await element.updateComplete;
      expect(element.value).to.equal('2:30 PM');
    });

    test('should format time with seconds when enabled', async () => {
      element.showSeconds = true;
      element.value = '14:30:45';
      await element.updateComplete;
      expect(element.value).to.equal('14:30:45');
    });
  });

  suite('Time validation', () => {
    test('should validate time within min/max range', async () => {
      element.minTime = '09:00';
      element.maxTime = '17:00';
      await element.updateComplete;

      // Valid time within range
      element.value = '12:00';
      await element.updateComplete;
      expect(element.value).to.equal('12:00');
    });

    test('should reject invalid time formats', async () => {
      const invalidValue = 'invalid-time';
      element.value = invalidValue;
      await element.updateComplete;

      // Should not set invalid value
      expect(element.value).to.not.equal(invalidValue);
    });
  });

  suite('Clock functionality', () => {
    test('should open and close clock', async () => {
      // Check initial state via DOM
      let dropdown = element.shadowRoot?.querySelector('.time-picker__dropdown--open');
      expect(dropdown).to.not.exist;

      element.open();
      await element.updateComplete;
      dropdown = element.shadowRoot?.querySelector('.time-picker__dropdown--open');
      expect(dropdown).to.exist;

      element.close();
      await element.updateComplete;
      dropdown = element.shadowRoot?.querySelector('.time-picker__dropdown--open');
      expect(dropdown).to.not.exist;
    });

    test('should toggle clock state via trigger button', async () => {
      const trigger = element.shadowRoot?.querySelector('.time-picker__trigger') as HTMLButtonElement;

      // Initially closed
      let dropdown = element.shadowRoot?.querySelector('.time-picker__dropdown--open');
      expect(dropdown).to.not.exist;

      // Click to open
      trigger.click();
      await element.updateComplete;
      dropdown = element.shadowRoot?.querySelector('.time-picker__dropdown--open');
      expect(dropdown).to.exist;

      // Click to close
      trigger.click();
      await element.updateComplete;
      dropdown = element.shadowRoot?.querySelector('.time-picker__dropdown--open');
      expect(dropdown).to.not.exist;
    });
  });

  suite('Time manipulation', () => {
    test('should clear time value', async () => {
      element.value = '12:00';
      await element.updateComplete;

      element.clear();
      await element.updateComplete;
      expect(element.value).to.equal('');
    });

    test('should set current time', async () => {
      element.setToNow();
      await element.updateComplete;

      // Should have some value after setting to now
      expect(element.value).to.not.equal('');
      // Basic format check for 24-hour format
      expect(element.value).to.match(/^\d{1,2}:\d{2}$/);
    });
  });

  suite('Event handling', () => {
    test('should dispatch time-change event', async () => {
      let eventFired = false;
      let eventDetail = null;

      element.addEventListener('nr-time-change', (e: Event) => {
        const customEvent = e as CustomEvent;
        eventFired = true;
        eventDetail = customEvent.detail;
      });

      element.value = '15:30';
      await element.updateComplete;

      // Allow time for event to be dispatched
      await aTimeout(10);

      expect(eventFired).to.be.true;
      expect(eventDetail).to.exist;
    });

    test('should dispatch clock open/close events', async () => {
      let openEventFired = false;
      let closeEventFired = false;

      element.addEventListener('nr-clock-open', () => {
        openEventFired = true;
      });

      element.addEventListener('nr-clock-close', () => {
        closeEventFired = true;
      });

      element.open();
      await element.updateComplete;
      await aTimeout(10);
      expect(openEventFired).to.be.true;

      element.close();
      await element.updateComplete;
      await aTimeout(10);
      expect(closeEventFired).to.be.true;
    });
  });

  suite('Accessibility', () => {
    test('should have proper ARIA attributes', async () => {
      element.label = 'Select Time';
      element.required = true;
      await element.updateComplete;

      const input = element.shadowRoot?.querySelector('input');
      expect(input).to.exist;
      expect(input?.getAttribute('required')).to.exist;
    });

    test('should support disabled state', async () => {
      element.disabled = true;
      await element.updateComplete;

      const input = element.shadowRoot?.querySelector('input');
      expect(input?.hasAttribute('disabled')).to.be.true;
    });

    test('should support readonly state', async () => {
      element.readonly = true;
      await element.updateComplete;

      const input = element.shadowRoot?.querySelector('input');
      expect(input?.hasAttribute('readonly')).to.be.true;
    });
  });

  suite('Size and variant attributes', () => {
    test('should apply size attribute to host', async () => {
      element.size = TimePickerSize.Large;
      await element.updateComplete;
      expect(element.hasAttribute('size')).to.be.true;
      expect(element.getAttribute('size')).to.equal('large');
    });

    test('should apply variant attribute to host', async () => {
      element.variant = TimePickerVariant.Outlined;
      await element.updateComplete;
      expect(element.hasAttribute('variant')).to.be.true;
      expect(element.getAttribute('variant')).to.equal('outlined');
    });
  });

  suite('Controller integration', () => {
    test('should have selection controller', () => {
      // Access private controller for testing (cast to any to bypass TypeScript)
      const controller = (element as any).selectionController;
      expect(controller).to.exist;
      expect(typeof controller.selectTime).to.equal('function');
    });

    test('should have validation controller', () => {
      const controller = (element as any).validationController;
      expect(controller).to.exist;
      expect(typeof controller.validateConstraints).to.equal('function');
    });

    test('should have formatting controller', () => {
      const controller = (element as any).formattingController;
      expect(controller).to.exist;
      expect(typeof controller.formatForDisplay).to.equal('function');
    });
  });
});
