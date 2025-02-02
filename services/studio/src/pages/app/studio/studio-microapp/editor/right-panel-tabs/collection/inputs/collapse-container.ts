import { generateDynamicContainer } from "../../../utils/input-collapse-container-generator.ts";

export const StudioCollectionCollapseContainer = generateDynamicContainer("collection_collapse_container", [
  "collection_data",
  "table_direction_block",
  "column_vertical_container"
]);
