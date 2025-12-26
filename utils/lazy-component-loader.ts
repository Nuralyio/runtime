/**
 * Lazy Component Loader
 *
 * Dynamically loads wrapper components on-demand when they are first used.
 * This prevents loading @nuralyui packages that aren't needed by the app.
 */

// Track which components have been loaded
const loadedComponents = new Set<string>();
const loadingPromises = new Map<string, Promise<void>>();

// Component import map - maps component tag names to their module paths
const componentImports: Record<string, () => Promise<any>> = {
  // Layout components with @nuralyui dependencies
  'grid-row-block': () => import('../components/ui/components/layout/Grid/Row'),
  'grid-col-block': () => import('../components/ui/components/layout/Grid/Col'),
  'panel-block': () => import('../components/ui/components/layout/Panel/Panel'),
  'tabs-block': () => import('../components/ui/components/layout/Tabs/Tabs'),
  'card-block': () => import('../components/ui/components/layout/Card/Card'),

  // Input components with @nuralyui dependencies
  'select-block': () => import('../components/ui/components/inputs/Select/Select'),
  'button-block': () => import('../components/ui/components/inputs/Button/Button'),
  'checkbox-block': () => import('../components/ui/components/inputs/Checkbox/Checkbox'),
  'radio-button-block': () => import('../components/ui/components/inputs/RadioButton/Radio-button'),
  'color-picker-block': () => import('../components/ui/components/inputs/ColorPicker/colorpicker'),
  'date-picker-block': () => import('../components/ui/components/inputs/DatePicker/DatePicker'),
  'dropdown-block': () => import('../components/ui/components/inputs/Dropdown/Dropdown'),
  'text-input-block': () => import('../components/ui/components/inputs/TextInput/TextInput'),
  'number-input-block': () => import('../components/ui/components/inputs/NumberInput/NumberInput'),
  'textarea-block': () => import('../components/ui/components/inputs/Textarea/Textarea'),
  'slider-block': () => import('../components/ui/components/inputs/Slider/Slider'),
  'file-upload-block': () => import('../components/ui/components/inputs/FileUpload/FileUpload'),
  'form-block': () => import('../components/ui/components/inputs/Form/Form'),
  'icon-button-block': () => import('../components/ui/components/inputs/IconButton/iconbutton'),

  // Display components with @nuralyui dependencies
  'table-block': () => import('../components/ui/components/display/Table/Table'),
  'icon-block': () => import('../components/ui/components/display/Icon/Icon'),
  'image-block': () => import('../components/ui/components/display/Image/Image'),
  'divider-block': () => import('../components/ui/components/display/Divider/Divider'),
  'text-label-block': () => import('../components/ui/components/display/TextLabel/TextLabel'),
  'badge-block': () => import('../components/ui/components/display/Badge/Badge'),
  'tag-block': () => import('../components/ui/components/display/Tag/Tag'),
  'video-block': () => import('../components/ui/components/display/Video/Video'),
  'code-block': () => import('../components/ui/components/display/Code/Code'),

  // Navigation components
  'menu-block': () => import('../components/ui/components/navigation/Menu/Menu'),
  'link-block': () => import('../components/ui/components/navigation/Link/Link'),
  'embed-url-block': () => import('../components/ui/components/navigation/EmbedURL/EmbedURL'),

  // Advanced components
  'ai-chat-block': () => import('../components/ui/components/advanced/AIChat/AIChat'),
  'collapse-block': () => import('../components/ui/components/advanced/Collapse/Collapse'),
  'collection-viewer': () => import('../components/ui/components/advanced/Collections/Collections'),
  'ref-component-container-block': () => import('../components/ui/components/advanced/RefComponent/RefComponent'),
  'rich-text-block': () => import('../components/ui/components/advanced/RichText/RichText'),
  'micro-app-block': () => import('../components/ui/components/advanced/MicroApp/MicroApp'),

  // Utility components
  'document-block': () => import('../components/ui/components/utility/Document/Document'),
  'vertical-container-block': () => import('../components/ui/components/layout/Containers/Container'),
  'toast-container': () => import('../components/ui/components/ToastContainer/ToastContainer'),
};

/**
 * Load a component by its tag name
 */
export async function loadComponent(tagName: string): Promise<void> {
  // Already loaded
  if (loadedComponents.has(tagName)) {
    return;
  }

  // Already loading - wait for it
  if (loadingPromises.has(tagName)) {
    return loadingPromises.get(tagName);
  }

  const importFn = componentImports[tagName];
  if (!importFn) {
    console.warn(`[LazyLoader] No import found for component: ${tagName}`);
    return;
  }

  const loadPromise = importFn()
    .then(() => {
      loadedComponents.add(tagName);
      loadingPromises.delete(tagName);
    })
    .catch((error) => {
      console.warn(`[LazyLoader] Failed to load component ${tagName}:`, error);
      loadingPromises.delete(tagName);
    });

  loadingPromises.set(tagName, loadPromise);
  return loadPromise;
}

/**
 * Load multiple components in parallel
 */
export async function loadComponents(tagNames: string[]): Promise<void> {
  await Promise.all(tagNames.map(loadComponent));
}

/**
 * Check if a component is loaded
 */
export function isComponentLoaded(tagName: string): boolean {
  return loadedComponents.has(tagName);
}

/**
 * Get all available component tag names
 */
export function getAvailableComponents(): string[] {
  return Object.keys(componentImports);
}
