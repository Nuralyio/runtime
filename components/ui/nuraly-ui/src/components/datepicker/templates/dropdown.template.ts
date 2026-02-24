import { html, TemplateResult } from 'lit';
import { classMap } from 'lit/directives/class-map.js';

/**
 * Render month dropdown template
 */
export const renderMonthDropdown = (
  isOpen: boolean,
  currentMonth: number,
  months: string[],
  onMonthSelect: (monthIndex: number) => void
): TemplateResult => {
  if (!isOpen) return html``;

  return html`
    <div class="month-dropdown dropdown-open">
      <div class="dropdown-content">
        ${months.map((month, index) => html`
          <div 
            class="dropdown-item ${classMap({ 'selected': index === currentMonth - 1 })}"
            @click=${() => onMonthSelect(index)}
          >
            ${month.charAt(0).toUpperCase() + month.slice(1)}
          </div>
        `)}
      </div>
    </div>
  `;
};

/**
 * Render year dropdown template
 */
export const renderYearDropdown = (
  isOpen: boolean,
  currentYear: number,
  onYearSelect: (year: number) => void
): TemplateResult => {
  if (!isOpen) return html``;

  // Generate years array (current year ± 10 years)
  const years: number[] = [];
  for (let year = currentYear - 10; year <= currentYear + 10; year++) {
    years.push(year);
  }

  return html`
    <div class="year-dropdown dropdown-open">
      <div class="dropdown-content">
        ${years.map(year => html`
          <div 
            class="dropdown-item ${classMap({ 'selected': year === currentYear })}"
            @click=${() => onYearSelect(year)}
          >
            ${year}
          </div>
        `)}
      </div>
    </div>
  `;
};
