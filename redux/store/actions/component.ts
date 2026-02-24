import { type ComponentElement } from '../component/component.interface';

const isServer = typeof window === "undefined";


export type UpdateType = "style" | "event" | "input" | "values" | "style_handlers";

export let clipboardComponent: ComponentElement | null = null;

