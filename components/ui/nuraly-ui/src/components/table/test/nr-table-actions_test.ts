import {html, fixture, expect} from '@open-wc/testing';
import '../components/nr-table-actions';
import {HyTableActions} from '../components/nr-table-actions';

suite('HyTableActions', () => {
  test('init table actions', async () => {
    const selectedItems = 1;
    const el: HyTableActions = await fixture(
      html`<nr-table-actions .selectedItems=${selectedItems}></nr-table-actions>`
    );
    const textContainer = el.shadowRoot!.querySelector('span')!;
    expect(el.selectedItems).to.equal(selectedItems);
    expect(textContainer.textContent).to.equal(`${selectedItems} selected`);
  });

  test('cancel selection', async () => {
    const el: HyTableActions = await fixture(html`<nr-table-actions></nr-table-actions>`);
    const cancelBtn = el.shadowRoot?.querySelector('button');
    let cancelSelectionDispatched = false;
    el.addEventListener('cancel-selection', () => {
      cancelSelectionDispatched = true;
    });
    cancelBtn?.click();
    expect(cancelSelectionDispatched).to.be.true;
  });
});
