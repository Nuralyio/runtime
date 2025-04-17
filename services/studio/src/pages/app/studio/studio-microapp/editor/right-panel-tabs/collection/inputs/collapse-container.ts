import { generateDynamicContainer } from "../../../utils/input-collapse-container-generator.ts";

export const StudioCollectionCollapseContainer = generateDynamicContainer("collection_collapse_container", [
  "component_value_text_block",
  "component_id_text_block",
  "collection_data",
  "table_direction_block",
  "column_vertical_container",
  "border_collapse_container"
]);
