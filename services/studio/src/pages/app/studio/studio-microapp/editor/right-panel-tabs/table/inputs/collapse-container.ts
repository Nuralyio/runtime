import { generateDynamicContainer } from "../../../utils/input-collapse-container-generator.ts";

export const StudioTableCollapseContainer = generateDynamicContainer("table_collapse_container", [
  "table_values_handler_block",
  "table_selection_mode",
  //"table_columns_block",
  "table_filter_block",
  "table_select_event_block",
  "table_search_event_block",
  "table_sort_event_block",
  "table_paginate_event_block"
]);
