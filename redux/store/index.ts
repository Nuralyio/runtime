/**
 * Redux Store - Core State Atoms
 * Contains all nanostores atoms and reactive state management
 */

// Component Store
export { 
  $components,
  $applicationComponents, 
  $selectedComponent,
  $currentComponentId,
  $hoveredComponentId,
  $hoveredComponent,
  $draggingComponentInfo,
  $componentWithChildren,
  $runtimeStyles,
  $runtimeValues,
  $componentRuntimeValuesById,
  $componentRuntimeValueByKey,
  $componentsByUUIDs,
  $runtimeStylescomponentStyleByID,
  getAllChildrenRecursive,
  getDirectChildren,
  $componentById,
  setComponentRuntimeValue,
  setComponentRuntimeValues,
  setcomponentRuntimeStyleAttribute,
  clearComponentRuntimeValues,
  clearComponentRuntimeValue,
  clearAllRuntimeValues,
  clearComponentRuntimeStyleAttributes
} from './component/store';

// Component Helpers
export {
  fillComponentChildren,
  fillApplicationComponents,
  extractChildresIds,
  extractAllChildrenIds
} from './component/helper';

// Application Store  
export { $applications, $currentApplication, $editorState, $resizing } from './apps';

// Page Store
export { 
  $pages, 
  $currentPage,
  $currentPageViewPort,
  $pageZoom,
  $contextMenuEvent,
  $showBorder,
  $currentPageId,
  $microAppCurrentPage,
  $pageSize,
  $applicationPages,
  refreshPageStoreVar
} from './page';

// Context/Variables Store
export { $context } from './context';

// Environment Store
export { ViewMode, $environment } from './environment';

// Toast Store
export { $toasts } from './toast';

// Debug Store
export { $debug } from './debug';

// Provider Store
export { $providers } from './provider';

// Permissions Store
export {
  $permissionsCache,
  $permissionsLoading,
  getResourcePermissions,
  refreshResourcePermissions,
  invalidateResourcePermissions,
  getCachedPermissions,
  subscribeToPermissions,
  clearPermissionsCache
} from './permissions';
export type { ResourcePermission, ParsedPermissions } from './permissions';

// App Members Store
export {
  $appMembersCache,
  getAppMembersData,
  refreshAppMembersData,
  invalidateAppMembersCache,
  getCachedAppMembersData,
  updateCachedMembers,
  updateCachedPendingInvites,
  updateCachedRoles
} from './app-members';
export type { AppMember, AppRole, PendingInvite, AppMembersData } from './app-members';

// KV Store
export {
  $kvCache,
  $showKvModal,
  getKvNamespaces,
  getKvEntries,
  refreshKvNamespaces,
  refreshKvEntries,
  invalidateKvCache,
  invalidateEntriesCache,
  getCachedKvNamespaces,
  getCachedKvEntries,
  updateCachedNamespaces,
  updateCachedEntries,
  showKvModal,
  closeKvModal
} from './kv';
export type { KvNamespace, KvEntry, KvEntryVersion, KvData, KvValueType } from './kv';

// Type Definitions
export type { ComponentElement } from './component/component.interface';
export type { PageElement } from '../handlers/pages/page.interface';
