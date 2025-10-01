import '../table.component';
import {HyTable} from '../table.component';
import {fixture, html, expect} from '@open-wc/testing';
import {SelectionMode, SortOrder} from '../table.types';
suite('HyTableComponent', () => {
  const headers = [
    {key: 'name', name: 'Name'},
    {key: 'age', name: 'Age'},
  ];
  const rows = [
    {name: 'John', age: 30},
    {name: 'Doe', age: 55},
    {name: 'Jack', age: 20},
    {name: 'Phil', age: 35},
    {name: 'Sebastian', age: 45},
    {name: 'Thibaut', age: 44},
  ];
  test('init table', async () => {
    const el: HyTable = await fixture(html`<nr-table .headers=${headers} .rows=${rows}></nr-table>`);
    expect(el.rowsCopy).to.deep.equal(rows);
    expect(el.displayedRows).to.deep.equal(el.rowsCopy.slice(0, el.selectedItemPerPage));
    expect(el.currentPage).to.equal(1);
  });

  test('sort data correctly', async () => {
    const el: HyTable = await fixture(html`<nr-table .headers=${headers} .rows=${rows}></nr-table>`);
    const sortToNameEvent = new CustomEvent('', {detail: {index: 0}});
    const rowsAscToName = [
      {name: 'Doe', age: 55},
      {name: 'Jack', age: 20},
      {name: 'John', age: 30},
      {name: 'Phil', age: 35},
      {name: 'Sebastian', age: 45},
      {name: 'Thibaut', age: 44},
    ];
    el._handleSortOrder(sortToNameEvent);
    await el.updateComplete;
    expect(el.sortAttribute.order).to.equal(SortOrder.Ascending);
    expect(el.rowsCopy).to.deep.equal(rowsAscToName);
    const rowsDescToName = [
      {name: 'Thibaut', age: 44},
      {name: 'Sebastian', age: 45},
      {name: 'Phil', age: 35},
      {name: 'John', age: 30},
      {name: 'Jack', age: 20},
      {name: 'Doe', age: 55},
    ];
    el._handleSortOrder(sortToNameEvent);
    await el.updateComplete;
    expect(el.sortAttribute.order).to.equal(SortOrder.Descending);
    expect(el.rowsCopy).to.deep.equal(rowsDescToName);
    el._handleSortOrder(sortToNameEvent);
    await el.updateComplete;
    expect(el.sortAttribute.order).to.equal(SortOrder.Default);
    expect(el.rowsCopy).to.deep.equal(rows);
  });

  suite('Multiple selection', () => {
    const selectedItems = Array(rows.length).fill(false);
    test('select one item', async () => {
      const el: HyTable = await fixture(
        html`<nr-table .headers=${headers} .rows=${rows} .selectionMode=${SelectionMode.Multiple}></nr-table>`
      );
      expect(el.selectedItems).to.deep.equal(selectedItems);
      const selectFirstItemEvent = new CustomEvent('', {detail: {index: 1, value: true}});
      el._handleCheckOne(selectFirstItemEvent);
      await el.updateComplete;
      expect(el.selectedItems[1]).to.be.true;
      const selectSecondItemEvent = new CustomEvent('', {detail: {index: 3, value: true}});
      el._handleCheckOne(selectSecondItemEvent);
      await el.updateComplete;
      expect(el.selectedItems[3]).to.be.true;
      expect(el.selectedItems[1]).to.be.true;
    });
    test('select all', async () => {
      const el: HyTable = await fixture(
        html`<nr-table .headers=${headers} .rows=${rows} .selectionMode=${SelectionMode.Multiple}></nr-table>`
      );
      expect(el.selectedItems).to.deep.equal(selectedItems);
      const selectAllItemsEvent = new CustomEvent('', {detail: {isEveryItemChecked: false}});
      el._handleCheckAll(selectAllItemsEvent);
      await el.updateComplete;
      expect(el.selectedItems.every((v) => v)).to.be.true;
      const unselectAllItemsEvent = new CustomEvent('', {detail: {isEveryItemChecked: true}});
      el._handleCheckAll(unselectAllItemsEvent);
      await el.updateComplete;
      expect(el.selectedItems.every((v) => !v)).to.be.true;
    });
  });

  suite('Single selection', () => {
    const selectedItems = Array(rows.length).fill(false);

    test('select one item', async () => {
      const el: HyTable = await fixture(
        html`<nr-table .headers=${headers} .rows=${rows} .selectionMode=${SelectionMode.Multiple}></nr-table>`
      );
      expect(el.selectedItems).to.deep.equal(selectedItems);
      const selectFirstItemEvent = new CustomEvent('', {detail: {index: 0}});
      el._handleSelectOne(selectFirstItemEvent);
      await el.updateComplete;
      expect(el.selectedItems[0]).to.be.true;
      const selectSecondItemEvent = new CustomEvent('', {detail: {index: 3}});
      el._handleSelectOne(selectSecondItemEvent);
      await el.updateComplete;
      expect(el.selectedItems[3]).to.be.true;
      expect(el.selectedItems[0]).to.be.false;
    });
  });

  test('search items', async () => {
    const el: HyTable = await fixture(html`<nr-table .headers=${headers} .rows=${rows}></nr-table>`);
    const searchEvent = new CustomEvent('', {detail: {value: 'Joh'}});
    el._handleSearch(searchEvent);
    await el.updateComplete;
    expect(el.rowsCopy.length).to.equal(1);
    expect(el.rowsCopy).to.deep.equal([{name: 'John', age: 30}]);
    const initSearchEvent = new CustomEvent('', {detail: {value: ''}});
    el._handleSearch(initSearchEvent);
    await el.updateComplete;
    expect(el.rowsCopy).to.deep.equal(rows);
  });

  test('update page', async () => {
    const el: HyTable = await fixture(html`<nr-table .headers=${headers} .rows=${rows}></nr-table>`);
    const updatePageEvent = new CustomEvent('', {detail: {page: 2}});
    el._handleUpdatePage(updatePageEvent);
    await el.updateComplete;
    expect(el.currentPage).to.equal(2);
    expect(el.displayedRows).to.deep.equal([{name: 'Thibaut', age: 44}]);
  });
  test('update item per page', async () => {
    const el: HyTable = await fixture(html`<nr-table .headers=${headers} .rows=${rows}></nr-table>`);
    const updateItemPerPageEvent = new CustomEvent('', {detail: {selectedItemPerPage: el.itemPerPage[1]}});
    expect(el.displayedRows).to.deep.equal([
      {name: 'John', age: 30},
      {name: 'Doe', age: 55},
      {name: 'Jack', age: 20},
      {name: 'Phil', age: 35},
      {name: 'Sebastian', age: 45},
    ]);
    el._handleItemPerPage(updateItemPerPageEvent);
    await el.updateComplete;
    expect(el.selectedItemPerPage).to.equal(el.itemPerPage[1]);
    expect(el.currentPage).to.equal(1);
    expect(el.displayedRows).to.deep.equal(rows);
  });
});
