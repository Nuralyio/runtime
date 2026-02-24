# Tag

Lightweight label component with optional close and checkable behavior, inspired by Ant Design Tag.

## Usage

```html
<nr-tag>Default</nr-tag>
<nr-tag color="red">Red</nr-tag>
<nr-tag color="#1677ff">Custom</nr-tag>
<nr-tag closable @nr-tag-close=${() => console.log('closed')}>Closable</nr-tag>
<nr-tag checkable checked @nr-tag-checked-change=${(e) => console.log(e.detail.checked)}>Checkable</nr-tag>
```

## Props
- color: preset color or any css color string
- bordered: show border (default true)
- size: default | small
- closable: show close icon
- checkable: toggles when clicked
- checked: current state when checkable
- disabled: disable interactions
