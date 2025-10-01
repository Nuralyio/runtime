import {html, fixture, expect} from '@open-wc/testing';
import '../components/nr-table-pagination';
import {HyTablePagination} from '../components/nr-table-pagination';
import {Sizes} from '../table.types';

suite('HyTablePagination', () => {
  test('init pagination', async () => {
    const numberOfItems = 100;
    const itemPerPage = [5, 10, 15];
    const selectedItemPerPage = itemPerPage[0];
    const currentPage = 1;
    const size = Sizes.Normal;
    const el: HyTablePagination = await fixture(
      html`<nr-table-pagination
        .numberOfItems=${numberOfItems}
        .itemPerPage=${itemPerPage}
        .selectedItemPerPage=${selectedItemPerPage}
        .currentPage=${currentPage}
        .size=${size}
      ></nr-table-pagination>`
    );
    expect(el.numberOfItems).to.equal(numberOfItems);
    expect(el.itemPerPage).to.equal(itemPerPage);
    expect(el.selectedItemPerPage).to.equal(selectedItemPerPage);
    expect(el.currentPage).to.equal(currentPage);
    expect(el.size).to.equal(size);
    expect(el.numberOfPages).to.equal(20);
    expect(el.fromItem).to.equal(1);
    expect(el.toItem).to.equal(5);
    expect(el.enablePrevious).to.be.false;
    expect(el.enableNext).to.be.true;
  });

  test('handles item per page change', async () => {
    const numberOfItems = 100;
    const itemPerPage = [10, 20, 50];
    const selectedItemPerPage = itemPerPage[0];
    const currentPage = 1;
    const el: HyTablePagination = await fixture(html`<nr-table-pagination
      .numberOfItems=${numberOfItems}
      .itemPerPage=${itemPerPage}
      .selectedItemPerPage=${selectedItemPerPage}
      .currentPage=${currentPage}
    ></nr-table-pagination>`);
    expect(el.fromItem).to.equal(1);
    expect(el.toItem).to.equal(10);
    expect(el.enablePrevious).to.be.false;
    expect(el.enableNext).to.be.true;
    expect(el.numberOfPages).to.equal(10);

    const select = el.shadowRoot!.querySelector('select')!;
    select.value = '20';
    select.dispatchEvent(new Event('change'));
    await el.updateComplete;
    expect(el.selectedItemPerPage).to.equal(20);
    expect(el.fromItem).to.equal(1);
    expect(el.toItem).to.equal(20);
    expect(el.enablePrevious).to.be.false;
    expect(el.enableNext).to.be.true;
    expect(el.numberOfPages).to.equal(5);
  });

  test('handles next page action', async () => {
    const numberOfItems = 100;
    const itemPerPage = [10, 20, 50];
    const selectedItemPerPage = itemPerPage[0];
    const currentPage = 1;
    const el: HyTablePagination = await fixture(html`<nr-table-pagination
      .numberOfItems=${numberOfItems}
      .itemPerPage=${itemPerPage}
      .selectedItemPerPage=${selectedItemPerPage}
      .currentPage=${currentPage}
    ></nr-table-pagination>`);
    expect(el.currentPage).to.equal(1);
    expect(el.fromItem).to.equal(1);
    expect(el.toItem).to.equal(10);
    expect(el.enablePrevious).to.be.false;
    expect(el.enableNext).to.be.true;

    el._nextPage();
    await el.updateComplete;
    expect(el.currentPage).to.equal(2);
    expect(el.fromItem).to.equal(11);
    expect(el.toItem).to.equal(20);
    expect(el.enablePrevious).to.be.true;
    expect(el.enableNext).to.be.true;
  });

  test('handles previous page action', async () => {
    const numberOfItems = 100;
    const itemPerPage = [10, 20, 50];
    const selectedItemPerPage = itemPerPage[0];
    const currentPage = 10;
    const el: HyTablePagination = await fixture(html`<nr-table-pagination
      .numberOfItems=${numberOfItems}
      .itemPerPage=${itemPerPage}
      .selectedItemPerPage=${selectedItemPerPage}
      .currentPage=${currentPage}
    ></nr-table-pagination>`);
    expect(el.currentPage).to.equal(10);
    expect(el.fromItem).to.equal(91);
    expect(el.toItem).to.equal(100);
    expect(el.enablePrevious).to.be.true;
    expect(el.enableNext).to.be.false;

    el._previousPage();
    await el.updateComplete;
    expect(el.currentPage).to.equal(9);
    expect(el.fromItem).to.equal(81);
    expect(el.toItem).to.equal(90);
    expect(el.enablePrevious).to.be.true;
    expect(el.enableNext).to.be.true;
  });
});
