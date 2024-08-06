import { $applications } from "$store/apps";
import { $components } from "$store/component/component-sotre";
import { $pages } from "$store/page/page-store";
import { $providers } from "$store/providers/store";
import { defineMiddleware } from "astro:middleware";

// `context` and `next` are automatically typed
export const onRequest = defineMiddleware((context, next) => {
    console.debug('re -initing stores');
    $applications.set([]);
    $providers.set([]);
    $pages.set([]);
    $components.set([]);
    next()
});