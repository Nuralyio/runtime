import {css} from 'lit';
const iconPickerStyles = css`
:host{
    position:relative;
    display:inline-block;
    width:38px;
    font-family:IBM Plex Sans;
}
.input-container{
    display:flex;
    align-items:center;
    justify-content:space-between;
    border-radius:4px;
    border: var(--icon-picker-input-container-border);
    padding:5px 10px;
    cursor:pointer;
}
.icon-preview{
    margin-right:10px;
    color:var(--icon-picker-icon-preview);
    display:flex;
}

.dropdown{
    position:absolute;
    top:100%;
    left:0;
    z-index:1;
    background:var(--icon-picker-dropdown-background);
    border:var(--icon-picker-dropdown-border);
    border-radius:4px; 
    padding:0px 10px 10px 10px;
    box-shadow:0 4px 8px rgba(0,0,0,0.1);
    max-height:120px;
    overflow-y:auto;
    width:180px;
    display:grid;
    grid-template-columns:repeat(auto-fill,minmax(40px,1fr));
    gap:10px;
}
.icon-item{
    display:flex;
    align-items:center;
    justify-content:center;
    cursor:pointer;
    padding:5px;
    border-radius:4px;
    color:var(--icon-picker-icon-item-color);
}
.icon-item:hover{
    background-color:var(--icon-picker-icon-item-hover-background);
}
.icon-item.selected{
    border:var(--icon-picker-icon-item-selected-border);
} 
hy-icon{
    --hybrid-icon-color:var(--icon-picker-icon-preview);
}
.search-container{
    position:sticky;
    top:0;
    background:var(--icon-picker-dropdown-background);
    width:fit-content;
    padding-top:10px;
    grid-column:1/4;
}
input{
    border: var(--icon-picker-input-container-border);
    width:150px;
    background:var(--icon-picker-input-background-color);
    color:var(--icon-picker-icon-text-color);
    padding:5px;
    border-radius:5px;
    position:sticky;
    top:0;
}
input:focus{
    outline:none;
}
:host{
      --icon-picker-input-container-border: 2px solid #d0d0d0;
      --icon-picker-icon-preview: #000000;
      --icon-picker-icon-text-color: #393939;
      --icon-picker-dropdown-background:#ffffff;
      --icon-picker-dropdown-border:1px solid #d0d0d0;
      --icon-picker-icon-item-color:#000000;
      --icon-picker-icon-item-hover-background:#e0e0e0;
      --icon-picker-icon-item-selected-border:1px solid #d0d0d0; 
      --icon-picker-input-background-color:#ffffff;

}
      

@media (prefers-color-scheme: dark) {
    :host {
      --icon-picker-input-container-border: 2px solid #ddd;
      --icon-picker-icon-preview: #ffffff;
      --icon-picker-icon-text-color: #ffffff;
      --icon-picker-dropdown-background:#393939;
      --icon-picker-dropdown-border:1px solid #ddd;
      --icon-picker-icon-item-color:#ffffff;
      --icon-picker-icon-item-hover-background:#4c4c4c;
      --icon-picker-icon-item-selected-border:1px solid #ffffff;
      --icon-picker-input-background-color:#2d2d2d;
 
    }
  }

`

export const styles=iconPickerStyles