export type TabEditable = {
  canDeleteTab: boolean;
  canEditTabTitle: boolean;
  canAddTab: boolean;
  canMove: boolean;
};

export enum TabOrientation {
  Horizontal = 'horizontal',
  Vertical = 'vertical',
}
export enum TabsAlign{
  Right='right',
  Left ='left',
  Center ='center'
}

export enum TabEvent {
  removeTab = 'removeTab',
  tabEdited = 'tabEdited',
  tabTilteClick = 'tabTilteClick',
  tabOrderChange = 'tabOrderChange',
  addTab = 'addTab',
}

export const NOTHING_STRING = '';
export const EMPTY_STRING = '';

export const LABEL_ATTRIBUTES = 'label';
