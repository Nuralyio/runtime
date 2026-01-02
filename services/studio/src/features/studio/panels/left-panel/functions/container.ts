import { COMMON_ATTRIBUTES } from '../../../core/helpers/common_attributes.ts';

export const StudioFunctionContainer = [
  {
    uuid: "studio_function_container",
    application_id: "1",
    name: "Parent Color Container",
    type: "container",
    ...COMMON_ATTRIBUTES,
    style: {
      display: "flex",
      "flex-direction": "column"
    },
    children_ids: [
      "studio_function_collection"
    ]
  }
];