import { ReactiveController, ReactiveControllerHost } from 'lit';

/**
 * Simple month/year dropdown controller for datepicker
 * Manages the dropdown state for month and year selection
 */
export class MonthYearDropdownController implements ReactiveController {
  private _host: ReactiveControllerHost & HTMLElement & { dispatchEvent(event: Event): boolean };
  private _isMonthDropdownOpen: boolean = false;
  private _isYearDropdownOpen: boolean = false;

  constructor(host: ReactiveControllerHost & HTMLElement & { dispatchEvent(event: Event): boolean }) {
    this._host = host;
    this._host.addController(this);
  }

  hostConnected(): void {
    // Setup click outside listener to close dropdowns
    document.addEventListener('click', this.handleDocumentClick.bind(this));
  }

  hostDisconnected(): void {
    document.removeEventListener('click', this.handleDocumentClick.bind(this));
  }

  /**
   * Get month dropdown state
   */
  get isMonthDropdownOpen(): boolean {
    return this._isMonthDropdownOpen;
  }

  /**
   * Get year dropdown state
   */
  get isYearDropdownOpen(): boolean {
    return this._isYearDropdownOpen;
  }

  /**
   * Toggle month dropdown
   */
  toggleMonthDropdown(): void {
    this._isYearDropdownOpen = false; // Close year dropdown
    this._isMonthDropdownOpen = !this._isMonthDropdownOpen;
    this._host.requestUpdate();
  }

  /**
   * Toggle year dropdown
   */
  toggleYearDropdown(): void {
    this._isMonthDropdownOpen = false; // Close month dropdown
    this._isYearDropdownOpen = !this._isYearDropdownOpen;
    this._host.requestUpdate();
  }

  /**
   * Close all dropdowns
   */
  closeAllDropdowns(): void {
    this._isMonthDropdownOpen = false;
    this._isYearDropdownOpen = false;
    this._host.requestUpdate();
  }

  /**
   * Select a month (will be handled by the host component)
   */
  selectMonth(monthIndex: number): void {
    this._isMonthDropdownOpen = false;
    this._host.requestUpdate();
    
    // Dispatch event for the host to handle
    this._host.dispatchEvent(new CustomEvent('month-selected', {
      detail: { monthIndex },
      bubbles: true,
      composed: true
    }));
  }

  /**
   * Select a year (will be handled by the host component)  
   */
  selectYear(year: number): void {
    this._isYearDropdownOpen = false;
    this._host.requestUpdate();
    
    // Dispatch event for the host to handle
    this._host.dispatchEvent(new CustomEvent('year-selected', {
      detail: { year },
      bubbles: true,
      composed: true
    }));
  }

  /**
   * Handle document click to close dropdowns when clicking outside
   */
  private handleDocumentClick(event: Event): void {
    const target = event.target as HTMLElement;
    
    // Check if click is outside the datepicker component
    if (!this._host.contains(target)) {
      this.closeAllDropdowns();
    }
  }
}
