import { persistentAtom } from "@nanostores/persistent";
import { ComponentElement, DraggingComponentInfo } from "./interface";
import { atom, computed, keepMount } from "nanostores";
import { $currentPage, $pages } from "$store/page/store";
import { logger } from "@nanostores/logger";

export const $components = persistentAtom<ComponentElement[]>(
  "components",
  [],
  {
    encode: JSON.stringify,
    decode: JSON.parse,
  }
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
        (component: ComponentElement) => component.id === currentComponentId
      ) || null
    );
  }
);

export const $hoveredComponent = computed(
  [$components, $hoveredComponentId],
  (components: ComponentElement[], hoveredComponentId) => {
    return (
      components.find(
        (component: ComponentElement) => component.id === hoveredComponentId
      ) || null
    );
  }
);
export const $currentPageComponents = computed(
  [$componentWithChildrens, $currentPage, $pages],
  (components: ComponentElement[], currentPage) => {
    return currentPage?.componentIds
      ?.map((componentId) =>
        components.find(
          (component: ComponentElement) => component.id === componentId
        )
      )
      .filter((component) => component);
  }
);

export const $pagesWithComponents = computed(
  [$componentWithChildrens, $pages],
  (componentWithChildrens, pages) => {
    return (pages || []).map((page) => {
      page.components = page.componentIds.map((componentId) =>
        componentWithChildrens.find(
          (component: ComponentElement) => component.id === componentId
        )
      );
      return page;
    });
  }
);

const fillComponentChildrens = (
  components: ComponentElement[],
  component: ComponentElement
) => {
  if (!component.childrens) {
    component.childrens = [];
  }
  if (component.childrenIds) {
    component.childrenIds.map((componentChildId: string) =>
      components.find(
        (component: ComponentElement) => component.id === componentChildId
      )
    );
  }
  component.childrens = component.childrens.map(
    (componentChild: ComponentElement) =>
      fillComponentChildrens(components, componentChild)
  );
  return component;
};

keepMount($currentComponentId);

logger({
  currentComponentId: $currentComponentId,
  componentWithChildrens: $componentWithChildrens,
});
