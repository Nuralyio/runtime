import { type ComponentElement } from "@shared/redux/store/component/component.interface";

const isServer = typeof window === "undefined";


export type UpdateType = "style" | "event" | "input" | "values" | "styleHandlers";

export let clipboardComponent: ComponentElement | null = null;

