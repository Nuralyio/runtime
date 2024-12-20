import { StudioSelectCollapseContainer } from "./collapse-container.ts";
import { generateComponents } from "../../../utils/colorBlockGenerator.ts";
import { StudioSelectHelperFontSize } from "./helper-fontsize.ts";

export const StudioSelectInputs = [
    ...generateComponents("select_helper_color_block", "--hybrid-select-helper-text-color", "Helper Text Color"),
  ...generateComponents("select_label_color_block", "--hybrid-select-label-text-color", "Label color"),
  ...StudioSelectCollapseContainer,
  ...StudioSelectHelperFontSize
];