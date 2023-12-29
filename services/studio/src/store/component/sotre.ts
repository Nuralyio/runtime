import { persistentAtom } from "@nanostores/persistent";
import { type ComponentElement, type DraggingComponentInfo } from "./interface";
import { atom, computed, keepMount } from "nanostores";
import { $currentPage, $pages } from "$store/page/store";
import { logger } from "@nanostores/logger";

const isServer = typeof window === 'undefined';
const initialState = isServer ? [] : JSON.parse(window['__INITIAL_COMPONENT_STATE__'] ?? []);

export const $components = atom<ComponentElement[]>(
  initialState
);

export const $currentComponentId = persistentAtom<string>(
  "currentComponentId",
  null,
  {
    encode: JSON.stringify,
    decode: JSON.parse,
  }
);

export const $hoveredComponentId = atom<string>(null);

export const $draggingComponentInfo = persistentAtom<DraggingComponentInfo>(
  "draggingComponentInfo",
  null,
  {
    encode: JSON.stringify,
    decode: JSON.parse,
  }
);

export const $componentWithChildrens = computed(
  $components,
  (components: ComponentElement[]) => {
    return components.map((component: ComponentElement) =>
      fillComponentChildrens(components, component)
    );
  }
);

export const $selectedComponent = computed(
  [$components, $currentComponentId],
  (components: ComponentElement[], currentComponentId) => {
    return (
      components.find(
        (component: ComponentElement) => component.uuid === currentComponentId
      ) || null
    );
  }
);

export const $hoveredComponent = computed(
  [$components, $hoveredComponentId],
  (components: ComponentElement[], hoveredComponentId) => {
    return (
      components.find(
        (component: ComponentElement) => component.uuid === hoveredComponentId
      ) || null
    );
  }
);
export const $currentPageComponents = computed(
  [$componentWithChildrens, $currentPage, $pages],
  (components: ComponentElement[], currentPage) => {
    return currentPage?.component_ids
      ?.map((componentId) =>
        components.find(
          (component: ComponentElement) => component.uuid === componentId
        )
      )
      .filter((component) => component);
  }
);

export const $pagesWithComponents = computed(
  [$componentWithChildrens, $pages],
  (componentWithChildrens, pages) => {
    return (pages || []).map((page) => {
      page.components = page.component_ids.map((componentId) =>
        componentWithChildrens.find(
          (component: ComponentElement) => component.uuid === componentId
        )
      );
      return page;
    });
  }
);

const fillComponentChildrens = (
  components: ComponentElement[],
  component: ComponentElement,
  parent: ComponentElement | null = null // Add parent parameter with default value
) => {
  if (!component.childrens) {
    component.childrens = [];
  }
  if (component.childrenIds) {
    component.childrens = component.childrenIds?.map((componentChildId: string) => {
      const foundComponent = components.find((component: ComponentElement) => component.uuid === componentChildId);
      if (foundComponent) {
        // Recursively call fillComponentChildrens with the current component as the parent
        return fillComponentChildrens(components, foundComponent, component);
      }
      return null; // Handle the case where a child component is not found
    }).filter(Boolean); // Remove null values if any
  }

  // Add the parent attribute to the current component
  component.parent = structuredClone(parent);

  return component;
};


keepMount($currentComponentId);

/*
logger({
  components: $components,
  currentComponentId: $currentComponentId,
  componentWithChildrens: $componentWithChildrens,
});
*/
