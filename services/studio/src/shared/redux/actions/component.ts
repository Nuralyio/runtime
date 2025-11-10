import { type ComponentElement } from "../store/component/component.interface";

const isServer = typeof window === "undefined";


export type UpdateType = "style" | "event" | "input" | "values" | "styleHandlers" | "inputHandlers";

export let clipboardComponent: ComponentElement | null = null;

