export const isServer = typeof window === "undefined";
export const isVerbose = import.meta.env.PUBLIC_VERBOSE;