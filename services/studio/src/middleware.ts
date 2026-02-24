import { defineMiddleware } from "astro:middleware";

// Passthrough middleware
export const onRequest = defineMiddleware((context, next) => {
  return next();
});
