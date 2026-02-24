/**
 * Breakpoints for responsive layout
 */
export const enum LayoutBreakpoint {
  XS = 'xs',
  SM = 'sm',
  MD = 'md',
  LG = 'lg',
  XL = 'xl',
  XXL = 'xxl',
}

/**
 * Breakpoint width values in pixels
 */
export const BREAKPOINT_VALUES: Record<LayoutBreakpoint, number> = {
  [LayoutBreakpoint.XS]: 480,
  [LayoutBreakpoint.SM]: 576,
  [LayoutBreakpoint.MD]: 768,
  [LayoutBreakpoint.LG]: 992,
  [LayoutBreakpoint.XL]: 1200,
  [LayoutBreakpoint.XXL]: 1600,
};

/**
 * Sider theme options
 */
export const enum SiderTheme {
  Light = 'light',
  Dark = 'dark',
}

/**
 * Sider collapse trigger type
 */
export type SiderTrigger = 'default' | null;

/**
 * Callback for breakpoint changes
 */
export type OnBreakpoint = (broken: boolean) => void;

/**
 * Callback for collapse state changes
 */
export type OnCollapse = (collapsed: boolean, type: 'clickTrigger' | 'responsive') => void;

/**
 * Layout component properties
 */
export interface LayoutProps {
  hasSider?: boolean;
}

/**
 * Sider component properties
 */
export interface SiderProps {
  breakpoint?: LayoutBreakpoint;
  collapsed?: boolean;
  collapsedWidth?: number;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
  reverseArrow?: boolean;
  theme?: SiderTheme;
  trigger?: SiderTrigger;
  width?: number | string;
  zeroWidthTriggerStyle?: string;
  onBreakpoint?: OnBreakpoint;
  onCollapse?: OnCollapse;
}

/**
 * Header component properties
 */
export interface HeaderProps {
  height?: number | string;
}

/**
 * Footer component properties
 */
export interface FooterProps {
  padding?: string;
}

/**
 * Content component properties
 */
export interface ContentProps {}
