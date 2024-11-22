import { updatePageAction } from '$store/actions/page.ts';
import { updatePageHandler } from '$store/handlers/pages/handler.ts';
import type { PageElement } from '$store/handlers/pages/interfaces/interface.ts';
import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { live } from 'lit/directives/live.js';

@customElement('page-meta-infos')
export class PageMetaInfos extends LitElement {
    private debounceTimeout: NodeJS.Timeout | null = null;

    @property({ type: Object })
    page: PageElement;

    @state()
    isUrlValide: boolean = true;

    static override styles = [
        css`
            .container {
                display: flex;
                flex-direction: row;
            }
            .first_column {
                width: 60%;
            }
        `
    ];

    private handleNameInput(event: InputEvent) {
        const newName = (event.target as HTMLElement).innerText;

        if (this.debounceTimeout) {
            clearTimeout(this.debounceTimeout);
        }

        this.debounceTimeout = setTimeout(() => {
            this.updatePageName(newName);
        }, 300); // Adjust the debounce time as needed
    }

    private updatePageName(newName: string) {
        // Implement the logic to update the page name in your store or wherever it's stored
        updatePageHandler({
            ...this.page,
            name: newName
        })
    }
    private validateLocation(location) {
        // Implement your location validation logic here
        // For simplicity, this example checks if the location contains only alphabetical characters
        const regex = /^[a-zA-Z ]+$/;
        return regex.test(location);
      }

    private handleUrlInput(event: InputEvent) {
        const newUrl = (event.target as HTMLElement).innerText;

        if (this.debounceTimeout) {
            clearTimeout(this.debounceTimeout);
        }

        this.debounceTimeout = setTimeout(() => {
            this.isUrlValide = this.validateLocation(newUrl);
            if(this.isUrlValide)
            {
                this.updatePageUrl(newUrl);
            }
        }, 300);
    }

    private updatePageUrl(newUrl: string) {
        updatePageHandler({
            ...this.page,
            url: newUrl
        })
        
    }

    override render() {
        return html`
            <div class="container">
                <div class="first_column">
                    Page name
                </div>
                <div>
                    <p contenteditable @input=${this.handleNameInput} .innerText=${live(this.page.name)}></p>
                </div>
            </div>
            <div class="container">
                <div class="first_column">
                    Page URL
                </div>
                <div>
                    <p contenteditable @input=${this.handleUrlInput} .innerText=${live(this.page.url)}></p>
                    <label style="color:red" ?hidden=${this.isUrlValide}>URL is not valide</label>
                </div>
            </div>
        `;
    }
}
