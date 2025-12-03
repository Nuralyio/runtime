import { RuntimeHelpers } from '../../../../../utils/runtime-helpers.ts';
import Editor from '../../../../../state/editor.ts';

export function calculateStyles(ctx: {
  component: any;
  inputHandlersValue: Record<string, any>;
  calculatedStyles: Record<string, any>;
  style: CSSStyleDeclaration;
}) {
  ctx.calculatedStyles = {
    ...Editor.getComponentStyles(ctx.component),
    ...ctx.calculatedStyles,
  };

  const { innerAlignment } = ctx.inputHandlersValue;

  ctx.style.removeProperty("align-self");
  ctx.style.removeProperty("margin");
  ctx.style.removeProperty("margin-left");

  if (innerAlignment === "end") ctx.style.marginLeft = "auto";
  else if (innerAlignment === "middle") {
    ctx.style.alignSelf = "center";
    ctx.style.margin = "auto";
  }

  const { width, flex, cursor } = ctx.calculatedStyles;
  if (width && RuntimeHelpers.extractUnit(width) === "%") ctx.style.width = width;
  if (flex) ctx.style.flex = flex;
  if (cursor) ctx.style.cursor = cursor;
}