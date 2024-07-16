/* eslint-disable @typescript-eslint/no-explicit-any */
import {LitElement, html} from 'lit';
import {customElement, property, queryAll} from 'lit/decorators.js';
import {styles} from './menu.style.js';
import {IMenu} from './menu.types.js';
import './templates/hy-menu-link.js';
import './templates/hy-sub-menu.js';

@customElement('hy-menu')
export class HyMenuComponent extends LitElement {
  private _currentSelectedLink!: number;
  @queryAll('hy-menu-link')
  _menuLinks!: NodeListOf<HTMLElement>;

  @queryAll('hy-sub-menu')
  _subMenues!: NodeListOf<HTMLElement>;

  @property()
  items!: IMenu[];

  override firstUpdated(): void {
    this._getPreSelectedIndex();
  }

  _getPreSelectedIndex() {
    const listOfLinks = [...this._menuLinks.values()];
    this._currentSelectedLink = listOfLinks.findIndex((element) => element.hasAttribute('selected'));
  }

  _updateSelectedLink(updateSelectedLinkEvent: CustomEvent) {
    this._handleInitHighlighted();
    const newSelectedIndex = updateSelectedLinkEvent.detail.index;
    const value = updateSelectedLinkEvent.detail.value;
    if (this._currentSelectedLink >= 0) this._menuLinks[this._currentSelectedLink].removeAttribute('selected');
    this._menuLinks[newSelectedIndex].setAttribute('selected', 'true');
    this._currentSelectedLink = newSelectedIndex;
    const pathToOption = this._menuLinks[newSelectedIndex]
      .getAttribute('data-path')
      ?.split('-')
      .map((valueString) => +valueString);
    this.dispatchEvent(
      new CustomEvent('change', {
        bubbles: true,
        composed: true,
        detail: {path: pathToOption, value},
      })
    );
  }

  _handleInitHighlighted() {
    this._subMenues.forEach((element) => {
      if (element.hasAttribute('highlighted')) {
        element.removeAttribute('highlighted');
      }
    });
  }
  _selectMenu(selectMenuEvent:CustomEvent){
    this.dispatchEvent(new CustomEvent('change',{bubbles:true,composed:true,detail:{path:selectMenuEvent.detail.path,value:selectMenuEvent.detail.value}}));
  }

  _display(items: IMenu[], path: number[] = []): any {
    return items.map((menu, index) => {
      const currentPath = [...path, index].join('-');
      if (menu.children) {
        return html`
          <hy-sub-menu .text=${menu.text} .icon=${menu.icon} .disabled=${menu.disabled} data-path=${currentPath} @select-menu=${this._selectMenu}>
            ${this._display(menu.children, [...path, index])}
          </hy-sub-menu>
        `;
      } else {
        return html` <hy-menu-link
          data-path=${currentPath}
          icon=${menu.icon}
          text=${menu.text}
          link=${menu.link}
          iconposition=${menu.iconPosition}
          ?selected=${menu.selected}
          ?disabled=${menu.disabled}
          @selected-link=${this._updateSelectedLink}
        ></hy-menu-link>`;
      }
    });
  }

  override render() {
    return html`
      <ul>
        ${this._display(this.items)}
      </ul>
    `;
  }

  static override styles = [styles];
}
