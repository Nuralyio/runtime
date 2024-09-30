import {html, LitElement} from 'lit';
import '../carousel.component';
import {customElement} from 'lit/decorators.js';

@customElement('hy-carousel-demo')
export class CarouselDemo extends LitElement {
  override render() {
    return html`
      AUTOPLAY
      <hy-carousel ?autoplay=${true}>
        <div>
          <h3>Slide 1</h3>
          <p>Content for Slide 1</p>
        </div>
        <div>
          <h3>Slide 2</h3>
          <p>Content for Slide 2</p>
        </div>
        <div>
          <h3>Slide 3</h3>
          <p>Content for Slide 3</p>
        </div>
      </hy-carousel>
      <hr />

      WITH CONTROLS
      <hy-carousel>
        <div>
          <h3>Slide 1</h3>
          <p>Content for Slide 1</p>
        </div>
        <div>
          <h3>Slide 2</h3>
          <p>Content for Slide 2</p>
        </div>
        <div>
          <h3>Slide 3</h3>
          <p>Content for Slide 3</p>
        </div>
      </hy-carousel>
      <hr />
      <hy-carousel>
        <div>
          <img src="https://via.placeholder.com/150" alt="Image 1" />
        </div>
        <div>
          <img src="https://via.placeholder.com/150" alt="Image 2" />
        </div>

        <div>
          <img src="https://via.placeholder.com/150" alt="Image 4" />
        </div>
        <div>
          <img src="https://via.placeholder.com/150" alt="Image 6" />
        </div>
      </hy-carousel>
    `;
  }
}
