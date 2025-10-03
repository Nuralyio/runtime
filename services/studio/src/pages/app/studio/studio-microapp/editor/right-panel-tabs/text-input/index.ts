import { StudioTextInputDesign } from "./design";
import { StudioTextInputHandler } from "./handler.ts";
import { StudioTextInputTheme } from "./theme.ts";
import commonInputsCollapseBlock from "../../../common-blocks/common-inputs-collapse-block.ts";
import typographyCollapseBlock from "../../../common-blocks/typography-collapse-block.ts";
import sizeCollapseBlock from "../../../common-blocks/size-collpase-block.ts";

export const StudioTextInput = [
  ...StudioTextInputDesign,
  ...commonInputsCollapseBlock,
  ...typographyCollapseBlock,
  ...sizeCollapseBlock,
  ...StudioTextInputHandler,
  ...StudioTextInputTheme
];