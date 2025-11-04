
export const CommonButtonTheme = {
  "--nuraly-button-primary-background-color": "#26327b",
  "--nuraly-button-primary-border-color": "#26327b",
  "--nuraly-button-hover-color": "white",
  "--nuraly-button-hover-background-color": "#3949a3",
  "--nuraly-button-primary-hover-background-color": "#3949a3"
};

export const SingleButtonTheme= {
  ...CommonButtonTheme,
  "--nuraly-button-border-top-left-radius": "4px",
  "--nuraly-button-border-top-right-radius": "4px",
  "--nuraly-button-border-bottom-left-radius": "4px",
  "--nuraly-button-border-bottom-right-radius": "4px",
  "--nuraly-button-height": "25px"
}
export const InputBlockContainerTheme = {
  display: "flex",
  "align-items": "center",
  "justify-content": "space-between",
  "width": "277px"
};

export const CollapseContainerTheme = {
  "--nr-collapse-content-small-size-padding": "5px",
  "--nr-collapse-font-weight": "normal",
  "--nr-collapse-border-radius": "0px",
  "--nr-collapse-width": "292px",
  "--nr-collapse-border": "none",
  "--nr-collapse-border-bottom": "1px solid #ccc",
  "--nr-collapse-local-header-background-color": "#3d3d3d"
};


export const InputTextLabelTheme = {
  width: "95px"
};


export const RadioButtonWithTwoOptionsTheme = {
  "--nuraly-button-height": "26px",
  "--nuraly-button-width": "75px",
  "--nuraly-button-font-size": "12px",
...CommonButtonTheme
  
};


export const RadioButtonWithThreeOptionsTheme = {
  "--nuraly-button-height": "26px",
  "--nuraly-button-width": "50px",
  "--nuraly-button-font-size": "12px",
...CommonButtonTheme

};

export const TextInputTheme = {
  size: "small",
  width: "151px"
};

export const ButtonTheme = {
  "--nuraly-button-height": "26px",
  "--nuraly-button-width": "76px",
  "--nuraly-button-font-size": "12px",
  "--nuraly-button-border-top-left-radius": "4px",
  "--nuraly-button-border-top-right-radius": "4px",
  "--nuraly-button-border-bottom-left-radius": "4px",
  "--nuraly-button-border-bottom-right-radius": "4px",
...CommonButtonTheme

};

export const SelectTheme = {
  "--nuraly-select-width": "152px",
  "--nuraly-select-small-height": "22px",
  "size": "small"
};

export const CollapseHeaderTheme = {
  "font-size": "16px",
  "font-weight": "bold", 
  "margin-bottom": "10px",
  // "--resolved-text-label-color": "#0a3b97"
};