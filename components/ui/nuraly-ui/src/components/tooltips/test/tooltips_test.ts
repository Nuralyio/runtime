import {html, fixture, expect} from '@open-wc/testing';
import '../tooltips.component';
import {TooltipElement} from '../tooltips.component';
import {TooltipAlignment, TooltipPosition} from '../tooltips.constant';
suite('TooltipElement', () => {
  test('shows tooltip on mouseover and hides on mouseleave', async () => {
    const wrapper = await fixture(html`
      <div>
        <span id="target">Hover me</span>
        <hy-tooltip>Tooltip Content</hy-tooltip>
      </div>
    `);
    const target = wrapper.querySelector('#target')!;
    const tooltip: TooltipElement = wrapper.querySelector('hy-tooltip')!;

    expect(tooltip.show).to.be.false;

    target.dispatchEvent(new MouseEvent('mouseover'));
    expect(tooltip.show).to.be.true;

    target.dispatchEvent(new MouseEvent('mouseleave'));
    expect(tooltip.show).to.be.false;
  });

  test('init tooltip position on mouseleave', async () => {
    const wrapper = await fixture(html`
      <div>
        <span id="target">Hover me</span>
        <hy-tooltip>Tooltip Content</hy-tooltip>
      </div>
    `);
    const target = wrapper.querySelector('#target')!;
    const tooltip: TooltipElement = wrapper.querySelector('hy-tooltip')!;
    target.dispatchEvent(new MouseEvent('mouseover'));
    await tooltip.updateComplete;
    expect(tooltip.show).to.be.true;
    expect(tooltip.style.top).to.not.be.empty;
    expect(tooltip.style.left).to.not.be.empty;
    expect(tooltip.style.width).to.not.be.empty;

    target.dispatchEvent(new MouseEvent('mouseleave'));
    expect(tooltip.show).to.be.false;
    expect(tooltip.style.top).to.be.empty;
    expect(tooltip.style.left).to.be.empty;
    expect(tooltip.style.width).to.be.empty;
  });

  suite('calculates tooltip style correctly', () => {
    test('tooltip style when position is bottom and alignement is center', async () => {
      const wrapper = await fixture(html`
        <div>
          <span id="target">Hover me</span>
          <hy-tooltip position="${TooltipPosition.Bottom}" alignement="${TooltipAlignment.Center}">
            Tooltip Content
          </hy-tooltip>
        </div>
      `);
      const target = wrapper.querySelector('#target')!;
      const tooltip: TooltipElement = wrapper.querySelector('hy-tooltip')!;

      target.dispatchEvent(new MouseEvent('mouseover'));

      await tooltip.updateComplete;

      const targetRect = target.getBoundingClientRect();
      const tooltipRect = tooltip.getBoundingClientRect();

      expect(Math.ceil(+tooltip.style.top.split('px')[0])).to.equal(
        Math.ceil(targetRect.bottom + tooltip.verticalOffset)
      );
      expect(Math.ceil(+tooltip.style.left.split('px')[0])).to.equal(
        Math.ceil(targetRect.left - tooltipRect.width / 2 + targetRect.width / 2)
      );
    });

    test('tooltip style when position is left and alignement is end', async () => {
      const wrapper = await fixture(html`
        <div>
          <span id="target">Hover me</span>
          <hy-tooltip position="${TooltipPosition.Left}" alignement="${TooltipAlignment.End}">
            Tooltip Content
          </hy-tooltip>
        </div>
      `);
      const target = wrapper.querySelector('#target')!;
      const tooltip: TooltipElement = wrapper.querySelector('hy-tooltip')!;

      target.dispatchEvent(new MouseEvent('mouseover'));

      await tooltip.updateComplete;

      const targetRect = target.getBoundingClientRect();
      const tooltipRect = tooltip.getBoundingClientRect();

      expect(Math.ceil(+tooltip.style.top.split('px')[0])).to.equal(Math.ceil(targetRect.bottom - tooltipRect.height));
      expect(Math.ceil(+tooltip.style.left.split('px')[0])).to.equal(
        Math.ceil(targetRect.left - tooltipRect.width - tooltip.horizontalOffset)
      );
    });

    test('tooltip style when position is top and alignement is start', async () => {
      const wrapper = await fixture(html`
        <div>
          <span id="target">Hover me</span>
          <hy-tooltip position="${TooltipPosition.Top}" alignement="${TooltipAlignment.Start}">
            Tooltip Content
          </hy-tooltip>
        </div>
      `);
      const target = wrapper.querySelector('#target')!;
      const tooltip: TooltipElement = wrapper.querySelector('hy-tooltip')!;

      target.dispatchEvent(new MouseEvent('mouseover'));

      await tooltip.updateComplete;

      const targetRect = target.getBoundingClientRect();
      const tooltipRect = tooltip.getBoundingClientRect();

      expect(Math.ceil(+tooltip.style.top.split('px')[0])).to.equal(
        Math.ceil(targetRect.top - tooltipRect.height - tooltip.verticalOffset)
      );
      expect(Math.ceil(+tooltip.style.left.split('px')[0])).to.equal(
        Math.ceil(targetRect.left - tooltip.horizontalOffset)
      );
    });
  });

  suite('removes event listeners on disconnectedCallback', () => {
    test('removes mouseleave listener', async () => {
      const wrapper = await fixture(html`
        <div>
          <span id="target">Hover me</span>
          <hy-tooltip>Tooltip Content</hy-tooltip>
        </div>
      `);
      const target = wrapper.querySelector('#target')!;
      const tooltip: TooltipElement = wrapper.querySelector('hy-tooltip')!;

      target.dispatchEvent(new MouseEvent('mouseover'));
      expect(tooltip.show).to.be.true;

      target.dispatchEvent(new MouseEvent('mouseleave'));
      expect(tooltip.show).to.be.false;

      target.dispatchEvent(new MouseEvent('mouseover'));
      expect(tooltip.show).to.be.true;

      wrapper.removeChild(tooltip);
      target.dispatchEvent(new MouseEvent('mouseleave'));
      expect(tooltip.show).to.be.true;
    });

    test('removes mouseover listener', async () => {
      const wrapper = await fixture(html`
        <div>
          <span id="target">Hover me</span>
          <hy-tooltip>Tooltip Content</hy-tooltip>
        </div>
      `);
      const target = wrapper.querySelector('#target')!;
      const tooltip: TooltipElement = wrapper.querySelector('hy-tooltip')!;

      target.dispatchEvent(new MouseEvent('mouseover'));
      expect(tooltip.show).to.be.true;

      target.dispatchEvent(new MouseEvent('mouseleave'));
      expect(tooltip.show).to.be.false;

      wrapper.removeChild(tooltip);
      target.dispatchEvent(new MouseEvent('mouseover'));
      expect(tooltip.show).to.be.false;
    });
  });
});
