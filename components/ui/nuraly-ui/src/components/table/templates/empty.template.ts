import { html } from 'lit';
import type { TableHost } from '../interfaces/table-host.interface';

/**
 * Renders the empty state template for the table when there is no data
 * @param host - The table host component
 * @returns Empty state template
 */
export function renderEmptyTemplate(host: TableHost) {
  // Calculate colspan: headers + selection column (if present)
  const colspan = host.headers.length + (host.selectionMode ? 1 : 0);

  return html`
    <tr class="empty-row">
      <td colspan="${colspan}" class="empty-cell">
        <div class="empty-state">
          ${host.emptyIcon
            ? html`
                <div class="empty-icon">
                  <nr-icon name="${host.emptyIcon}"></nr-icon>
                </div>
              `
            : html`
                <div class="empty-icon">
                  <svg
                    width="64"
                    height="64"
                    viewBox="0 0 64 64"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M32 8C18.745 8 8 18.745 8 32s10.745 24 24 24 24-10.745 24-24S45.255 8 32 8zm0 44c-11.028 0-20-8.972-20-20s8.972-20 20-20 20 8.972 20 20-8.972 20-20 20z"
                      fill="currentColor"
                      opacity="0.3"
                    />
                    <path
                      d="M32 20c-1.105 0-2 .895-2 2v12c0 1.105.895 2 2 2s2-.895 2-2V22c0-1.105-.895-2-2-2zm0 20c-1.105 0-2 .895-2 2s.895 2 2 2 2-.895 2-2-.895-2-2-2z"
                      fill="currentColor"
                    />
                  </svg>
                </div>
              `}
          <div class="empty-text">${host.emptyText}</div>
        </div>
      </td>
    </tr>
  `;
}
