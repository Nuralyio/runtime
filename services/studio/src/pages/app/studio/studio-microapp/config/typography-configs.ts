// Central configuration for all typography blocks
import { createStyleBlock } from "../factories/style-block-factory.ts";
import { fontSizeConfig } from "./font-size-config.ts";
import { fontFamilyConfig } from "./font-family-config.ts";
import { fontStyleConfig } from "./font-style-config.ts";
import { fontWeightConfig } from "./font-weight-config.ts";
import { fontColorConfig } from "./font-color-config.ts";
import { letterSpacingConfig } from "./letter-spacing-config.ts";
import { lineHeightConfig } from "./line-height-config.ts";
import { textAlignConfig, verticalAlignConfig } from "./text-align-config.ts";
import { textDecorationConfig } from "./text-decoration-config.ts";

// Generate all typography blocks using the factory
export const typographyBlocks = {
  fontSize: createStyleBlock(fontSizeConfig),
  fontFamily: createStyleBlock(fontFamilyConfig),
  fontStyle: createStyleBlock(fontStyleConfig),
  fontWeight: createStyleBlock(fontWeightConfig),
  fontColor: createStyleBlock(fontColorConfig),
  letterSpacing: createStyleBlock(letterSpacingConfig),
  lineHeight: createStyleBlock(lineHeightConfig),
  textAlign: createStyleBlock(textAlignConfig),
  verticalAlign: createStyleBlock(verticalAlignConfig),
  textDecoration: createStyleBlock(textDecorationConfig)
};

// Flatten all blocks into a single array for easy import
export const allTypographyBlocks = Object.values(typographyBlocks).flat();
