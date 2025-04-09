
export const CommonButtonTheme = {
  "--hybrid-button-primary-background-color": "#26327b",
  "--hybrid-button-primary-border-color": "#26327b",
  "--hybrid-button-hover-color": "white",
  "--hybrid-button-hover-background-color": "#3949a3",
  "--hybrid-button-primary-hover-background-color": "#3949a3"
};

export const SingleButtonTheme= {
  ...CommonButtonTheme,
  "--hybrid-button-border-top-left-radius": "4px",
  "--hybrid-button-border-top-right-radius": "4px",
  "--hybrid-button-border-bottom-left-radius": "4px",
  "--hybrid-button-border-bottom-right-radius": "4px",
  "--hybrid-button-height": "25px"
}
export const InputBlockContainerTheme = {
  display: "flex",
  "align-items": "center",
  "justify-content": "space-between",
  "width": "277px"
};

export const CollapseContainerTheme = {
  "--hy-collapse-content-small-size-padding": "5px",
  "--hy-collapse-font-weight": "normal",
  "--hy-collapse-border-radius": "0px",
  "--hy-collapse-width": "292px",
  "--hy-collapse-border": "none",
  "--hy-collapse-border-bottom": "1px solid #ccc",
  "--hy-collapse-local-header-background-color": "#3d3d3d"
};


export const InputTextLabelTheme = {
  width: "95px"
};


export const RadioButtonWithTwoOptionsTheme = {
  "--hybrid-button-height": "26px",
  "--hybrid-button-width": "75px",
  "--hybrid-button-font-size": "12px",
...CommonButtonTheme
  
};


export const RadioButtonWithThreeOptionsTheme = {
  "--hybrid-button-height": "26px",
  "--hybrid-button-width": "50px",
  "--hybrid-button-font-size": "12px",
...CommonButtonTheme

};

export const TextInputTheme = {
  size: "small",
  width: "151px"
};

export const ButtonTheme = {
  "--hybrid-button-height": "26px",
  "--hybrid-button-width": "76px",
  "--hybrid-button-font-size": "12px",
  "--hybrid-button-border-top-left-radius": "4px",
  "--hybrid-button-border-top-right-radius": "4px",
  "--hybrid-button-border-bottom-left-radius": "4px",
  "--hybrid-button-border-bottom-right-radius": "4px",
...CommonButtonTheme

};

export const SelectTheme = {
  "--hybrid-select-width": "152px",
  "--hybrid-select-small-height": "22px",
  "size": "small"
};

export const CollapseHeaderTheme = {
  "font-size": "16px",
  "font-weight": "bold", 
  "margin-bottom": "10px",
  // "--resolved-text-label-color": "#0a3b97"
};