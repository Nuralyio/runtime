import { html, LitElement, css } from 'lit';
import '../chatbot-container.component';
import { customElement, property, state } from 'lit/decorators.js';

@customElement('chatbot-demo')
export class CarouselDemo extends LitElement {
  @property({ type: Boolean }) direction: boolean = false;
  @property({ type: String }) currentLanguage: string = 'en'; // Default language

  @state() suggestions :any = {
    en: [
      'Search document',
      'Filter results',
      'Highlight matches',
      'Sort by relevance'
    ],
    ar: [
      'البحث في المستند',
      'تصفية النتائج',
      'تمييز التطابقات',
      'الترتيب حسب الأهمية'
    ]
  };

  static override styles = css`
    .button-container {
      display: flex;
      justify-content: flex-end;
      margin-bottom: 10px;
    }

    button {
      background-color: #007bff;
      color: white;
      border: none;
      padding: 10px 20px;
      font-size: 16px;
      cursor: pointer;
      border-radius: 5px;
      transition: background-color 0.3s ease;
    }

    button:hover {
      background-color: #0056b3;
    }

    button:active {
      background-color: #003f7f;
    }

    button:focus {
      outline: none;
      box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.5);
    }
  `;



  private switchLanguage() {
    this.currentLanguage = this.currentLanguage === 'en' ? 'ar' : 'en';
  }

  override render() {
    return html`
      <div class="button-container">
        <button @click="${this.switchLanguage}">
          Switch to ${this.currentLanguage === 'en' ? 'Arabic' : 'English'}
        </button>
      </div>

      <div style="height: 400px; width: 60%">
        <chatbot-agent
          .direction="${this.currentLanguage !== 'en'}"
          .suggestions="${this.suggestions[this.currentLanguage]}"
        ></chatbot-agent>
      </div>

      <nr-chatbot-container .direction="${this.currentLanguage !== 'en'}">
        <chatbot-agent
          .direction="${this.currentLanguage !== 'en'}"
          .suggestions="${this.suggestions[this.currentLanguage]}"
        ></chatbot-agent>
      </nr-chatbot-container>
    `;
  }
}