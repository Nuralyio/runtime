import { createBorderRadiusBlock } from "../../factories/border-radius-factory.ts";

// Create border radius components using the factory
export default createBorderRadiusBlock({
  containerUUID: "border_radius_vertical_container",
  labelUUID: "border_radius_label",
  inputUUID: "border_radius_block",
  handlerUUID: "label_border_radius_handler",
  label: " ", // Empty space as per original
  containerStyle: {
    display: "flex",
    "align-items": "center", 
    "justify-content": "space-between",
    "width": "276px"
  },
  labelStyle: {
    width: "90px"
  },
  inputStyle: {
    width: "50px"
  }
});