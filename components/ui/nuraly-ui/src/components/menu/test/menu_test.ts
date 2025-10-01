import {expect, fixture, html} from '@open-wc/testing';
import '../menu.component';
import {HyMenuComponent} from '../menu.component';
import {IMenu} from '../menu.types';

suite('HyMenuComponent', () => {
  const mockMenuItems: IMenu[] = [
    {text: ' link', link: 'menu.html', icon: 'user'},
    {
      text: 'first menu',
      children: [
        {text: 'under the first menu', link: '', icon: 'user', iconPosition: 'right'},
        {text: 'selected menu', link: '', icon: 'user', selected: true},
        {
          text: 'under the first menu',
          link: '',
          icon: 'bomb',
          children: [{text: 'child of under the link', link: '', icon: 'user'}],
        },
      ],
      disabled: false,
      link: '',
    },
    {
      text: 'second menu',
      children: [
        {text: 'under second menu', link: '', icon: 'warning'},
        {text: 'under second menu', link: '', icon: 'pencil'},
        {
          text: 'menu under second menu',
          link: '',
          icon: 'bomb',
          children: [
            {
              text: 'children of menu under second menu',
              link: '',
              icon: 'book',
              children: [
                {text: 'children of children of menu unser second menu', link: '', icon: 'book', iconPosition: 'right'},
              ],
            },
          ],
        },
      ],
      disabled: false,
      link: '',
    },
  ];

  test('select the correct number of menu links and sub menus', async () => {
    const el: HyMenuComponent = await fixture(html`<nr-menu .items=${mockMenuItems}></nr-menu>`);

    expect(el._menuLinks).to.have.length(7);
    expect(el._subMenues).to.have.length(5);
  });

  test('update the selected link', async () => {
    const el: HyMenuComponent = await fixture(html`<nr-menu .items=${mockMenuItems}></nr-menu>`);
    const previousSelectedIndex = 2;
    const newSelectedIndex = 1;
    const event = new CustomEvent('selected-link', {
      detail: {index: newSelectedIndex},
    });
    el._updateSelectedLink(event);

    const selectedLink = el.shadowRoot!.querySelectorAll('nr-menu-link')[newSelectedIndex];
    expect(selectedLink).to.have.attribute('selected');
    const previouslySelectedLink = el.shadowRoot!.querySelectorAll('nr-menu-link')[previousSelectedIndex];
    expect(previouslySelectedLink).to.not.have.attribute('selected');
  });

  test('init highlighted', async () => {
    const el: HyMenuComponent = await fixture(html`<nr-menu .items=${mockMenuItems}></nr-menu>`);
    const subMenu = el.shadowRoot!.querySelector('nr-sub-menu')!;
    subMenu.setAttribute('highlighted', 'true');
    el._handleInitHighlighted();
    expect(subMenu).to.not.have.attribute('highlighted');
  });
});
