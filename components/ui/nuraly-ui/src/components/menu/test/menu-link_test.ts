import { html, fixture, expect } from '@open-wc/testing';
import { HyMenuLink } from '../templates/hy-menu-link';
import '../templates/hy-menu-link';
import { ICON_POSITION } from '../templates/menu-link.contants';

suite('HyMenuLinkComponent', () => {
  test('init menu link', async () => {
    const text = 'link text';
    const link = 'url';
    const icon = 'pencil';
    const el: HyMenuLink = await fixture(html`<hy-menu-link text="${text}" link=${link} icon=${icon}></hy-menu-link>`);
    const templateIcon = el.shadowRoot?.querySelector('nr-icon');
    const templateLink = el.shadowRoot?.querySelector('a');
    const templateText = el.shadowRoot?.querySelector('span');
    const templateLinkIcon = el.shadowRoot?.querySelector('#link-icon');
    expect(el.text).to.equal(text);
    expect(el.link).to.equal(link);
    expect(el.icon).to.equal(icon);
    expect(el.iconPosition).to.equal(ICON_POSITION.LEFT);
    expect(el.disabled).to.be.false;
    expect(el.selected).to.be.false;
    expect(templateIcon).to.have.attribute('name', icon);
    expect(templateLink).to.have.attribute('href', link);
    expect(templateText?.textContent).to.equal(text);
    expect(templateLinkIcon).to.not.exist;
  });

  test('icon only', async () => {
    const link = 'url';
    const icon = 'pencil';
    const el: HyMenuLink = await fixture(html`<hy-menu-link link=${link} icon=${icon}></hy-menu-link>`);
    const templateText = el.shadowRoot?.querySelector('span');
    const templateLinkIcon = el.shadowRoot?.querySelector('#link-icon');
    const anchors = el.shadowRoot?.querySelectorAll('a');
    expect(templateText).not.exist;
    expect(templateLinkIcon).to.exist;
    expect(templateLinkIcon).to.have.attribute('href', link);
    expect(templateLinkIcon?.children[0]).to.have.attribute('name', icon);
    expect(anchors).to.have.length(1);
  });
  test('text only', async () => {
    const link = 'url';
    const text = 'this is a text';
    const el: HyMenuLink = await fixture(html`<hy-menu-link link=${link} text=${text}></hy-menu-link>`);
    const templateText = el.shadowRoot?.querySelector('span');
    const templateLinkIcon = el.shadowRoot?.querySelector('#link-icon');
    const templateAnchor = el.shadowRoot!.querySelectorAll('a')!;
    expect(templateText).exist;
    expect(templateLinkIcon).not.to.exist;
    expect(templateAnchor).to.exist;
    expect(templateAnchor).to.have.length(1);
    expect(templateAnchor[0]).to.have.attribute('href', link);
    expect(templateAnchor[0].children[0].textContent).to.equal(text);
  });

  test('enabled link', async () => {
    const el: HyMenuLink = await fixture(html`<hy-menu-link> </hy-menu-link>`);
    const container = el.shadowRoot!.querySelector('li')!;
    let selectedLinkDispatch = false;
    el.addEventListener('selected-link', () => {
      selectedLinkDispatch = true;
    });
    container.click();
    expect(selectedLinkDispatch).to.be.true;
  });
  test('disabled link', async () => {
    const el: HyMenuLink = await fixture(html`<hy-menu-link disabled=${true}> </hy-menu-link>`);
    const container = el.shadowRoot!.querySelector('li')!;
    let selectedLinkDispatch = false;
    el.addEventListener('selected-link', () => {
      selectedLinkDispatch = true;
    });
    container.click();
    expect(selectedLinkDispatch).to.be.false;
  });
});
