import {html, LitElement, nothing} from 'lit';
import {styles} from './carousel.style.js';
import {customElement, property, queryAssignedElements, state} from 'lit/decorators.js';
import {repeat} from 'lit/directives/repeat.js';
import '../button/hy-button.component.js';
import '../icon/icon.component.js';

@customElement('hy-carousel')
export class CarouselComponent extends LitElement {
  static override styles = styles;

  @property() currentIndex = 0;
  @property() autoPlay = false;
  @property() autoplaySpeed = 3000;
  @queryAssignedElements()
  private slideElements!: HTMLElement[];
  @state()
  private displayedElements!: HTMLElement[];
  private intervalId: number | null = null;

  override firstUpdated() {
    this.displayedElements = this.slideElements.map((element, index) => {
      if (index != this.currentIndex) {
        element.classList.add('carousel-item-hidden');
      }
      return element;
    });
    if (this.autoPlay) {
      this.startAutoPlay();
    }
  }

  startAutoPlay() {
    this.intervalId = window.setInterval(() => {
      this.next();
    }, this.autoplaySpeed);
  }

  stopAutoPlay() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  next() {
    this.displayedElements[this.currentIndex].classList.add('carousel-item-hidden');
    if (this.displayedElements.length - 1 == this.currentIndex) {
      this.currentIndex = 0;
    } else {
      this.currentIndex++;
    }
    this.displayedElements[this.currentIndex].classList.remove('carousel-item-hidden');
  }

  prev() {
    this.displayedElements[this.currentIndex].classList.add('carousel-item-hidden');
    if (this.currentIndex == 0) {
      this.currentIndex = this.displayedElements.length - 1;
    } else {
      this.currentIndex--;
    }
    this.displayedElements[this.currentIndex].classList.remove('carousel-item-hidden');
  }

  goTo(index: number) {
    this.displayedElements[this.currentIndex].classList.add('carousel-item-hidden');
    this.currentIndex = index;
    this.displayedElements[this.currentIndex].classList.remove('carousel-item-hidden');
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    this.stopAutoPlay();
  }

  override render() {
    return html`
      <div class="carousel">
        <slot></slot>
        ${
          !this.autoPlay
            ? html`
                <div class="controls">
                  <hy-button
                    @click="${this.prev}"
                    type="ghost"
                    size="small"
                    class="button-control"
                    .icon="${['chevron-left']}"
                  ></hy-button>
                  <hy-button
                    @click="${this.next}"
                    type="ghost"
                    size="small"
                    class="button-control"
                    .icon="${['chevron-right']}"
                  ></hy-button>
                </div>
              `
            : nothing
        }

           <div class="dots">
          ${repeat(
            Array.from({length: this.displayedElements?.length}),
            (_, index) => html`
              <span
                class="dot ${index === this.currentIndex ? 'active' : ''}"
                @click="${() => this.goTo(index)}"
              ></span>
            `
          )}
        </div
      </div>
    `;
  }
}
