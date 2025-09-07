export const textDecorationConfig = {
  property: 'text-decoration',
  label: 'Text decoration',
  inputType: 'radio' as const,
  defaultValue: 'none',
  options: [
    { value: 'overline', icon: "font-awesome" },
    { value: 'line-through', icon: "strikethrough" },
    { value: 'underline', icon: "underline" },
    { value: 'underline overline', icon: "grip-lines" },
    { value: 'none', icon: "xmark" }
  ],
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
    "--hybrid-button-height": "26px",
    "--hybrid-button-width": "31px"
  }
};
