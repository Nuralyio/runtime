export interface ISection {
  header: string;
  content: string;
  open?: boolean;
  collapsible?: boolean;
}
export const enum CollapseSize {
  Small = 'small',
  Default = 'default',
  Large = 'large',
}
