import { $applications } from "@shared/redux/store/apps";
import { $components } from "@shared/redux/store/component/store";
import { $pages } from "@shared/redux/store/page";
import { $providers } from "@shared/redux/store/provider";
import { defineMiddleware } from "astro:middleware";

// `context` and `next` are automatically typed
export const onRequest = defineMiddleware((context, next) => {
  // console.debug("re -initing stores");
  $applications.set([]);
  $providers.set([]);
  $pages.set({});
  $components.set({});
  next();
});