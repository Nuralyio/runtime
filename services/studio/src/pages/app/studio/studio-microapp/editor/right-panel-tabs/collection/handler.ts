/*
{
      name: "onInit",
      label: "onInit"
    },*/

    import { createHandlersFromEvents } from "../../utils/handler-generator.ts";

export const StudioCollectionHandler = createHandlersFromEvents
  ([
    {
      name: "onInit",
      label: "onInit"
    },
   
  ], "studio_collection_handler");
