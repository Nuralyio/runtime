import { createHandlersFromEvents } from "../../utils/handler-generator.ts";

export const StudioTableHandler = createHandlersFromEvents
([
  {
    name: "onSelect",
    label: "onSelect"
  },
  {
    name: "onSearch",
    label: "onSearch"
  },
  {
    name: "onPaginate",
    label: "onPaginate"
  },
  {
    name: "onSort",
    label: "onSort"
  }
], "studio_table_handler");
