import {html, fixture, expect} from '@open-wc/testing';
import '../components/hy-table-content';
import {HyTableContent} from '../components/hy-table-content';
import {SelectionMode, SortOrder} from '../table.types';

suite('HyTableContent', () => {
  const headers = [
    {key: 'name', name: 'Name'},
    {key: 'age', name: 'Age'},
  ];
  const rows = [
    {name: 'John', age: 30},
    {name: 'Doe', age: 25},
  ];
  test('init table content', async () => {
    const el: HyTableContent = await fixture(
      html`<hy-table-content
        .headers=${headers}
        .rows=${rows}
        .sortAttribute=${{index: -1, order: SortOrder.Default}}
      ></hy-table-content>`
    );

    const headerElements = el.shadowRoot!.querySelectorAll('th span');
    expect(headerElements.length).to.equal(headers.length);
  });

  test('Specify selected items', async () => {
    const selectedItems = [true, false];
    const currentPage = 1;
    const itemPerPage = 2;

    const el: HyTableContent = await fixture(html`<hy-table-content
      .headers=${headers}
      .rows=${rows}
      .selectionMode=${SelectionMode.Multiple}
      .selectedItems=${selectedItems}
      .currentPage=${currentPage}
      .itemPerPage=${itemPerPage}
      .sortAttribute=${{index: -1, order: SortOrder.Default}}
    ></hy-table-content>`);

    const checkboxes: NodeListOf<HTMLInputElement> = el.shadowRoot!.querySelectorAll('input[type="checkbox"]');
    expect(checkboxes.length).to.equal(3);
    expect(checkboxes[1].checked).to.be.true;
    expect(checkboxes[2].checked).to.be.false;
  });

  test('expand row attribute on click', async () => {
    const headers = [
      {key: 'name', name: 'Name'},
      {key: 'age', name: 'Age'},
      {key: 'details', name: 'Details'},
    ];
    const rows = [
      {name: 'John', age: 30, details: 'John details'},
      {name: 'Doe', age: 25, details: 'Doe details'},
    ];

    const el: HyTableContent = await fixture(html`<hy-table-content
      .headers=${headers}
      .rows=${rows}
      expandable="details"
      .sortAttribute=${{index: -1, order: SortOrder.Default}}
    ></hy-table-content>`);

    const expandIcons: NodeListOf<HTMLElement> = el.shadowRoot!.querySelectorAll('.expand-icon');
    expect(expandIcons.length).to.equal(rows.length);

    expect(el.expand[0]).to.be.false;
    expect(el.expand[1]).to.be.false;
    expandIcons[0].click();
    expect(el.expand[0]).to.be.true;
    expect(el.expand[1]).to.be.false;
  });

  test('dispatch check-all element event', async () => {
    const el: HyTableContent = await fixture(html`<hy-table-content
      .headers=${headers}
      .rows=${rows}
      .sortAttribute=${{index: 0, order: SortOrder.Ascending}}
      .selectionMode=${SelectionMode.Multiple}
    ></hy-table-content>`);
    const globalCheckBox: Element = el.shadowRoot!.querySelectorAll('input[type="checkbox"]')[0];
    let dispatchCheckAllItem = false;
    el.addEventListener('check-all', () => {
      dispatchCheckAllItem = true;
    });
    globalCheckBox.dispatchEvent(new Event('change'));
    expect(dispatchCheckAllItem).to.be.true;
  });
  test('dispatch check one item event', async () => {
    const el: HyTableContent = await fixture(html`<hy-table-content
      .headers=${headers}
      .rows=${rows}
      .sortAttribute=${{index: 0, order: SortOrder.Ascending}}
      .selectionMode=${SelectionMode.Multiple}
    ></hy-table-content>`);
    const firstItemCheckBox: Element = el.shadowRoot!.querySelectorAll('input[type="checkbox"]')[1];
    let dispatchCheckItem = false;
    el.addEventListener('check-one', () => {
      dispatchCheckItem = true;
    });
    firstItemCheckBox.dispatchEvent(new Event('change'));
    expect(dispatchCheckItem).to.be.true;
  });
  test('dispatch select one event ', async () => {
    const el: HyTableContent = await fixture(html`<hy-table-content
      .headers=${headers}
      .rows=${rows}
      .sortAttribute=${{index: 0, order: SortOrder.Ascending}}
      .selectionMode=${SelectionMode.Single}
    ></hy-table-content>`);
    const firstItemRadio: Element = el.shadowRoot!.querySelector('input[type="radio"]')!;
    let dispatchSelectItem = false;
    el.addEventListener('select-one', () => {
      dispatchSelectItem = true;
    });
    firstItemRadio.dispatchEvent(new Event('change'));
    expect(dispatchSelectItem).to.be.true;
  });

  test('dispatch update sort order event', async () => {
    const el: HyTableContent = await fixture(html`<hy-table-content
      .headers=${headers}
      .rows=${rows}
      .sortAttribute=${{index: 0, order: SortOrder.Ascending}}
    ></hy-table-content>`);
    const th = el.shadowRoot?.querySelector('th');
    let dispatchUpdateSortOrder = false;
    el.addEventListener('update-sort', () => {
      dispatchUpdateSortOrder = true;
    });
    expect(dispatchUpdateSortOrder).to.be.false;
    th?.click();
    await el.updateComplete;
    expect(dispatchUpdateSortOrder).to.be.true;
  });
  suite('display sorting icon', () => {
    test('ascending icon', async () => {
      const el: HyTableContent = await fixture(html`<hy-table-content
        .headers=${headers}
        .rows=${rows}
        .sortAttribute=${{index: 0, order: SortOrder.Ascending}}
      ></hy-table-content>`);
      const sortIcon = el.shadowRoot!.querySelector('th span hy-icon')!;
      expect(sortIcon).to.exist;
      expect(sortIcon).to.have.attribute('name', 'long-arrow-up');
    });
    test('descending icon', async () => {
      const el: HyTableContent = await fixture(html`<hy-table-content
        .headers=${headers}
        .rows=${rows}
        .sortAttribute=${{index: 0, order: SortOrder.Descending}}
      ></hy-table-content>`);
      const sortIcon = el.shadowRoot!.querySelector('th span hy-icon')!;
      expect(sortIcon).to.exist;
      expect(sortIcon).to.have.attribute('name', 'long-arrow-down');
    });
    test('default icon', async () => {
      const el: HyTableContent = await fixture(html`<hy-table-content
        .headers=${headers}
        .rows=${rows}
        .sortAttribute=${{index: 0, order: SortOrder.Default}}
      ></hy-table-content>`);
      const sortIcon = el.shadowRoot!.querySelector('th span hy-icon')!;
      expect(sortIcon).to.exist;
      expect(sortIcon).to.have.attribute('name', 'arrows-v');
    });
  });
});
