import { LitElement, html, css } from 'lit';
import Prism from 'prismjs';
import { marked } from 'marked';
import 'prismjs/components/prism-javascript.min.js'; // Import JavaScript syntax highlighting
import 'prismjs/themes/prism-tomorrow.css'; // Prism theme
import { property } from 'lit/decorators.js';

class MarkdownRenderer extends LitElement {
  @property({ type: String }) markdown = ''; // The Markdown text to render

  static styles = css`
    pre {
      background-color: #282c34;
      color: #abb2bf;
      padding: 16px;
      border-radius: 8px;
      overflow: auto;
    }
    code {
      font-family: Consolas, 'Courier New', monospace;
    }
    .markdown-content {
      max-width: 800px;
      margin: 0 auto;
    }
  `;

  // Convert Markdown to HTML and highlight code
  getHtmlContent() {
    const html = marked(this.markdown); // Convert Markdown to HTML
    return html;
  }

  updated(changedProperties) {
    super.updated(changedProperties);
    this.highlightCode(); // Apply Prism highlighting after rendering
  }

  highlightCode() {
    const codeBlocks = this.shadowRoot!.querySelectorAll('pre code');
    codeBlocks.forEach(block => {
      Prism.highlightElement(block); // Highlight each code block
    });
  }

  render() {
    return html`
      <div class="markdown-content" .innerHTML="${this.getHtmlContent()}"></div>
    `;
  }
}

customElements.define('markdown-renderer', MarkdownRenderer);