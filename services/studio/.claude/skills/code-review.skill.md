# Code Review Skill

Perform thorough code reviews for TypeScript Lit Element reactive components in the Nuraly Studio codebase.

## What this skill does

This skill helps you:
- Review TypeScript Lit Element components for best practices and common issues
- Identify reactive property and state management problems
- Check for proper lifecycle method usage
- Validate event handling patterns
- Ensure proper memory management and cleanup
- Review component architecture and inheritance patterns
- Identify performance issues and optimization opportunities

## Technology Stack

- **Framework:** Lit 3.x (Web Components library)
- **Language:** TypeScript 5.x
- **Base Class:** `BaseElementBlock` (extends `LitElement`)
- **State Management:** Nanostores with RxJS subscriptions
- **Build Tool:** Astro

## When to invoke this skill

Invoke this skill when the user asks about:
- "Review this component"
- "Check this code for issues"
- "Is this Lit Element code correct?"
- "Review my changes"
- "What's wrong with this component?"
- "Check for memory leaks"
- "Review event handling"
- "Are there any issues with this code?"

## Instructions for AI

When this skill is invoked:

1. **Identify the code to review**: Determine which file(s) or code block needs review
2. **Understand the context**: Check if it extends `BaseElementBlock` or `LitElement`
3. **Apply review checklist**: Go through each category below systematically
4. **Provide actionable feedback**: Offer specific fixes with code examples
5. **Prioritize issues**: Categorize as Critical, Warning, or Suggestion

---

## Code Review Checklist

### 1. Reactive Properties (`@property`)

#### What to check:
- Properties that affect rendering use `@property()` decorator
- Correct `type` option for complex types
- `reflect: true` only when needed for CSS/attribute selectors
- Avoid mutable default values (arrays, objects)

#### Common Issues:

**Issue: Missing type converter for complex types**
```typescript
// BAD - Objects/arrays need explicit type
@property() items = [];

// GOOD - Specify type for proper conversion
@property({ type: Array }) items = [];
@property({ type: Object }) config = {};
```

**Issue: Mutable default values**
```typescript
// BAD - Shared reference across instances
@property({ type: Array }) items = [];
@property({ type: Object }) data = {};

// GOOD - Initialize in constructor or use getter
@property({ type: Array }) items;
constructor() {
  super();
  this.items = [];
}
```

**Issue: Unnecessary reflect**
```typescript
// BAD - Reflects large objects to DOM
@property({ type: Object, reflect: true }) data = {};

// GOOD - Only reflect primitives when needed for CSS
@property({ type: String, reflect: true }) variant = 'default';
```

---

### 2. Internal State (`@state`)

#### What to check:
- Internal-only reactive data uses `@state()` not `@property()`
- State changes trigger minimal re-renders
- No direct state mutation

#### Common Issues:

**Issue: Using @property for internal state**
```typescript
// BAD - Exposes internal state as attribute
@property({ type: Boolean }) isLoading = false;

// GOOD - Use @state for internal reactive state
@state() isLoading = false;
```

**Issue: Direct state mutation**
```typescript
// BAD - Mutating array doesn't trigger update
this.items.push(newItem);

// GOOD - Create new reference
this.items = [...this.items, newItem];
```

---

### 3. Lifecycle Methods

#### What to check:
- `connectedCallback()` calls `super.connectedCallback()`
- `disconnectedCallback()` calls `super.disconnectedCallback()`
- `firstUpdated()` calls `super.firstUpdated()`
- Subscriptions set up in `connectedCallback`, cleaned in `disconnectedCallback`
- DOM queries in `firstUpdated` or later, not constructor

#### Common Issues:

**Issue: Missing super call**
```typescript
// BAD - Breaks LitElement lifecycle
override connectedCallback() {
  this.setupListeners();
}

// GOOD - Always call super
override connectedCallback() {
  super.connectedCallback();
  this.setupListeners();
}
```

**Issue: DOM access in constructor**
```typescript
// BAD - Shadow DOM not ready
constructor() {
  super();
  this.shadowRoot.querySelector('.input'); // null!
}

// GOOD - Wait for firstUpdated
protected firstUpdated(_changedProperties: PropertyValues) {
  super.firstUpdated(_changedProperties);
  this.inputEl = this.shadowRoot.querySelector('.input');
}
```

---

### 4. Memory Management

#### What to check:
- All subscriptions stored and unsubscribed in `disconnectedCallback`
- Event listeners removed in `disconnectedCallback`
- No orphaned intervals/timeouts
- Proper use of `Subscription` from RxJS

#### Common Issues:

**Issue: Memory leak from unsubscribed observables**
```typescript
// BAD - No cleanup
override connectedCallback() {
  super.connectedCallback();
  eventDispatcher.on('event', this.handler);
}

// GOOD - Store and cleanup subscriptions
private subscription = new Subscription();

override connectedCallback() {
  super.connectedCallback();
  this.subscription.add(
    eventDispatcher.on('event', this.handler)
  );
}

override disconnectedCallback() {
  super.disconnectedCallback();
  this.subscription.unsubscribe();
}
```

**Issue: Event listeners not removed**
```typescript
// BAD - Listeners accumulate
override connectedCallback() {
  super.connectedCallback();
  window.addEventListener('resize', this.onResize);
}

// GOOD - Store bound reference and remove
private onResizeBound = this.onResize.bind(this);

override connectedCallback() {
  super.connectedCallback();
  window.addEventListener('resize', this.onResizeBound);
}

override disconnectedCallback() {
  super.disconnectedCallback();
  window.removeEventListener('resize', this.onResizeBound);
}
```

---

### 5. Event Handling

#### What to check:
- Custom events use `CustomEvent` with proper typing
- Event names follow conventions (`nr-*` for Nuraly UI events)
- `bubbles: true` and `composed: true` for shadow DOM traversal
- Use `this.executeEvent()` for component events in BaseElementBlock children

#### Common Issues:

**Issue: Event doesn't cross shadow DOM**
```typescript
// BAD - Won't bubble past shadow root
this.dispatchEvent(new CustomEvent('change', { detail: value }));

// GOOD - Crosses shadow DOM boundaries
this.dispatchEvent(new CustomEvent('change', {
  detail: value,
  bubbles: true,
  composed: true
}));
```

**Issue: Not using executeEvent in BaseElementBlock**
```typescript
// BAD - Bypasses studio event system
@nr-change=${(e) => this.dispatchEvent(new CustomEvent('onChange'))}

// GOOD - Uses studio event system
@nr-change=${(e: CustomEvent) => {
  this.executeEvent('onChange', e, { value: e.detail.value });
}}
```

---

### 6. Rendering Patterns

#### What to check:
- Use `nothing` instead of `null`/`undefined`/empty string for conditional rendering
- Avoid inline object/array literals in templates (creates new references)
- Use `classMap`, `styleMap` for dynamic classes/styles
- Avoid complex expressions in templates

#### Common Issues:

**Issue: Using null instead of nothing**
```typescript
// BAD - Renders "null" as text
render() {
  return this.show ? html`<div>Content</div>` : null;
}

// GOOD - Renders nothing
import { nothing } from 'lit';
render() {
  return this.show ? html`<div>Content</div>` : nothing;
}
```

**Issue: Inline objects causing re-renders**
```typescript
// BAD - New object reference every render
render() {
  return html`<child-el .config=${{ key: 'value' }}></child-el>`;
}

// GOOD - Stable reference
private config = { key: 'value' };
render() {
  return html`<child-el .config=${this.config}></child-el>`;
}
```

---

### 7. Property Bindings

#### What to check:
- `.property` for objects, arrays, and complex values
- `?attribute` for boolean attributes
- `@event` for event listeners
- Attribute binding (no prefix) for string primitives

#### Common Issues:

**Issue: Wrong binding type**
```typescript
// BAD - Serializes object to string
<nr-select options=${this.options}></nr-select>

// GOOD - Passes object reference
<nr-select .options=${this.options}></nr-select>

// BAD - Sets attribute "disabled" or "false"
<nr-button disabled=${this.isDisabled}></nr-button>

// GOOD - Boolean attribute binding
<nr-button ?disabled=${this.isDisabled}></nr-button>
```

---

### 8. Async Operations

#### What to check:
- Async operations check if component is still connected
- Loading states managed properly
- Error handling present
- No race conditions with stale requests

#### Common Issues:

**Issue: Setting state after disconnect**
```typescript
// BAD - May set state after unmount
async fetchData() {
  const data = await api.getData();
  this.data = data; // Component might be unmounted!
}

// GOOD - Check if still connected
async fetchData() {
  const data = await api.getData();
  if (this.isConnected) {
    this.data = data;
  }
}
```

**Issue: Race condition with stale requests**
```typescript
// BAD - Old request might complete after new one
async onSearchChange(query: string) {
  const results = await search(query);
  this.results = results;
}

// GOOD - Track current request
private currentSearchId = 0;

async onSearchChange(query: string) {
  const searchId = ++this.currentSearchId;
  const results = await search(query);
  if (searchId === this.currentSearchId) {
    this.results = results;
  }
}
```

---

### 9. TypeScript Best Practices

#### What to check:
- Proper typing for properties, state, and methods
- No `any` types where avoidable
- Interface definitions for complex objects
- Proper use of generics

#### Common Issues:

**Issue: Untyped properties**
```typescript
// BAD - No type safety
@property({ type: Object }) component;
@state() resolvedInputs: any = {};

// GOOD - Proper typing
@property({ type: Object }) component: ComponentElement;
@state() resolvedInputs: Record<string, unknown> = {};
```

---

### 10. Component Registration

#### What to check:
- `@customElement()` decorator with unique tag name
- Tag name follows `kebab-case` convention
- Tag name includes prefix for namespacing (e.g., `nr-`, `*-block`)

#### Common Issues:

**Issue: Duplicate or invalid tag name**
```typescript
// BAD - No namespace, might conflict
@customElement("button")

// GOOD - Namespaced and follows convention
@customElement("icon-picker-block")
```

---

### 11. BaseElementBlock-Specific Patterns

For components extending `BaseElementBlock`:

#### What to check:
- Implements `renderComponent()` method
- Uses `this.resolvedInputs` for reactive inputs
- Uses `this.executeEvent()` for triggering events
- Uses `this.inputRef` for main element reference
- Uses `this.registerCallback()` for value callbacks

#### Correct Pattern:
```typescript
@customElement("my-component-block")
export class MyComponent extends BaseElementBlock {
  static override styles = styles;

  override async connectedCallback() {
    await super.connectedCallback();
    this.registerCallback("value", (newValue) => {
      // Handle value updates
    });
  }

  renderComponent() {
    const value = this.resolvedInputs?.value ?? '';

    return html`
      <nr-my-component
        ${ref(this.inputRef)}
        .value=${value}
        style=${styleMap(this.getStyles())}
        class="drop-${this.component.uuid}"
        @nr-change=${(e: CustomEvent) => {
          this.executeEvent('onChange', e, { value: e.detail.value });
        }}
      ></nr-my-component>
    `;
  }
}
```

---

## Review Output Format

When providing a review, structure feedback as:

### Critical Issues
Issues that will cause bugs, memory leaks, or crashes.

### Warnings
Issues that may cause problems or indicate poor practices.

### Suggestions
Improvements for maintainability, performance, or readability.

### Code Quality Summary
Brief overall assessment and key recommendations.

---

## Example Review

**User:** Review this component:
```typescript
@customElement("my-input-block")
export class MyInput extends BaseElementBlock {
  @property() value = '';
  @state() items = [];

  connectedCallback() {
    eventDispatcher.on('update', this.handleUpdate);
  }

  handleUpdate = (data) => {
    this.items.push(data);
  }

  render() {
    return this.value ? html`<input value=${this.value}>` : null;
  }
}
```

**Review:**

### Critical Issues

1. **Memory Leak - Missing subscription cleanup** (Line 6-7)
   - `eventDispatcher.on()` subscription is never unsubscribed
   - Fix: Store in `this.subscription` and call `super.connectedCallback()`

2. **Missing super.connectedCallback()** (Line 6)
   - LitElement lifecycle will break
   - Fix: Add `super.connectedCallback()` as first line

### Warnings

1. **Direct array mutation** (Line 10)
   - `this.items.push()` won't trigger reactive update
   - Fix: `this.items = [...this.items, data]`

2. **Wrong binding type for value** (Line 14)
   - Should use `.value` property binding for input value
   - Fix: `<input .value=${this.value}>`

### Suggestions

1. **Use `nothing` instead of `null`** (Line 14)
   - Import `nothing` from 'lit' for conditional rendering

2. **Add TypeScript types** (Lines 3, 4, 9)
   - Add proper types for `items` and `handleUpdate` parameter

3. **Should extend BaseElementBlock pattern**
   - Use `renderComponent()` instead of `render()`
   - Use `this.resolvedInputs` for reactive input values

### Code Quality Summary
This component has critical memory management issues and doesn't follow the BaseElementBlock patterns used in this codebase. Immediate fixes needed for the subscription leak and missing super call.
