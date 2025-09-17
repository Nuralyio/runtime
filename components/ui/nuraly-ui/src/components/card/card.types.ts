/**
 * Card size variants
 */
export const enum CardSize {
  Small = 'small',
  Default = 'default',
  Large = 'large',
}

/**
 * Card configuration interface
 */
export interface CardConfig {
  header?: string;
  size?: CardSize;
  clickable?: boolean;
}
