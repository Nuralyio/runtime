# Contributing to Nuraly UI

Thank you for your interest in contributing to Nuraly UI! This document provides guidelines and information for contributors.

## 🚀 Getting Started

### Prerequisites

- Node.js 16+ or Bun
- Git
- A code editor (VS Code recommended)

### Development Setup

1. **Fork and clone the repository:**
   ```bash
   git clone https://github.com/YOUR_USERNAME/NuralyUI.git
   cd NuralyUI
   ```

2. **Install dependencies:**
   ```bash
   npm install
   # or
   bun install
   ```

3. **Start the development server:**
   ```bash
   npm start
   # or
   bun start
   ```

4. **Open your browser:**
   ```
   http://localhost:8000
   ```

## 📝 Contribution Guidelines

### Types of Contributions

We welcome several types of contributions:

- **🐛 Bug Reports** - Help us identify and fix issues
- **💡 Feature Requests** - Suggest new components or enhancements
- **🔧 Bug Fixes** - Submit fixes for reported issues
- **🆕 New Components** - Add new reusable components
- **📚 Documentation** - Improve docs, examples, and guides
- **🧪 Tests** - Add or improve test coverage
- **🎨 Design** - UI/UX improvements and accessibility enhancements

### Before You Start

1. **Check existing issues** - Look for related bugs or feature requests
2. **Discuss major changes** - Create an issue to discuss significant changes
3. **Follow coding standards** - Maintain consistency with existing code
4. **Consider impact** - Think about how changes affect existing users

## 🏗️ Development Workflow

### Creating a New Component

1. **Create component directory:**
   ```bash
   mkdir src/components/my-component
   cd src/components/my-component
   ```

2. **Component structure:**
   ```
   my-component/
   ├── my-component.component.ts    # Main component
   ├── my-component.style.ts        # Component styles
   ├── my-component.types.ts        # TypeScript types
   ├── index.ts                     # Public exports
   ├── package.json                 # Component package
   ├── react.ts                     # React wrapper
   ├── demo/                        # Demo files
   │   └── my-component-demo.ts
   └── test/                        # Test files
       └── my-component.test.ts
   ```

3. **Follow naming conventions:**
   - Component class: `HyMyComponent`
   - Custom element: `hy-my-component`
   - Files: `my-component.component.ts`

### Code Standards

#### TypeScript

```typescript
import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';

@customElement('hy-my-component')
export class HyMyComponent extends LitElement {
  @property({ type: String }) variant: 'primary' | 'secondary' = 'primary';
  @property({ type: Boolean }) disabled = false;

  static styles = css`
    :host {
      display: inline-block;
    }
  `;

  protected render() {
    return html`
      <button 
        class="btn btn--${this.variant}"
        ?disabled=${this.disabled}
      >
        <slot></slot>
      </button>
    `;
  }
}
```

#### Styling Guidelines

- Use CSS custom properties for theming
- Follow BEM-like naming for classes
- Ensure responsive design
- Support dark/light themes
- Maintain accessibility standards

```typescript
static styles = css`
  :host {
    --component-primary-color: var(--hy-primary-color, #4F46E5);
    --component-spacing: var(--hy-spacing-md, 16px);
  }

  .btn {
    background: var(--component-primary-color);
    padding: var(--component-spacing);
    border-radius: var(--hy-border-radius, 6px);
  }

  .btn--primary {
    /* Primary variant styles */
  }

  .btn--secondary {
    /* Secondary variant styles */
  }

  @media (prefers-color-scheme: dark) {
    :host {
      --component-primary-color: var(--hy-primary-color-dark, #6366F1);
    }
  }
`;
```

#### Testing

Write comprehensive tests for your components:

```typescript
import { fixture, expect } from '@open-wc/testing';
import { html } from 'lit';
import './my-component.component.js';

describe('HyMyComponent', () => {
  it('renders with default properties', async () => {
    const el = await fixture(html`<hy-my-component></hy-my-component>`);
    expect(el.variant).to.equal('primary');
    expect(el.disabled).to.be.false;
  });

  it('renders different variants', async () => {
    const el = await fixture(html`<hy-my-component variant="secondary"></hy-my-component>`);
    expect(el.variant).to.equal('secondary');
  });
});
```

### React Wrapper

Provide React wrappers for better React integration:

```typescript
import { createComponent } from '@lit-labs/react';
import { HyMyComponent } from './my-component.component.js';

export const HyMyComponentReact = createComponent({
  tagName: 'hy-my-component',
  elementClass: HyMyComponent,
  react: React,
  events: {
    onChange: 'change',
    onInput: 'input',
  },
});
```

### Demo Component

Create interactive demos:

```typescript
import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import '../my-component.component.js';

@customElement('hy-my-component-demo')
export class HyMyComponentDemo extends LitElement {
  @state() variant = 'primary';
  @state() disabled = false;

  render() {
    return html`
      <div class="demo">
        <h2>My Component Demo</h2>
        
        <div class="controls">
          <label>
            Variant:
            <select @change=${this._onVariantChange}>
              <option value="primary">Primary</option>
              <option value="secondary">Secondary</option>
            </select>
          </label>
          
          <label>
            <input 
              type="checkbox" 
              @change=${this._onDisabledChange}
            /> Disabled
          </label>
        </div>

        <div class="preview">
          <hy-my-component 
            variant=${this.variant}
            ?disabled=${this.disabled}
          >
            Click me!
          </hy-my-component>
        </div>
      </div>
    `;
  }

  private _onVariantChange(e: Event) {
    this.variant = (e.target as HTMLSelectElement).value;
  }

  private _onDisabledChange(e: Event) {
    this.disabled = (e.target as HTMLInputElement).checked;
  }
}
```

## 📋 Pull Request Process

1. **Create a feature branch:**
   ```bash
   git checkout -b feature/my-new-component
   # or
   git checkout -b fix/component-bug
   ```

2. **Make your changes:**
   - Write clean, well-documented code
   - Add tests for new functionality
   - Update documentation as needed
   - Ensure all tests pass

3. **Commit your changes:**
   ```bash
   git add .
   git commit -m "feat: add new component with accessibility features"
   ```

4. **Push to your fork:**
   ```bash
   git push origin feature/my-new-component
   ```

5. **Create a Pull Request:**
   - Provide a clear title and description
   - Reference any related issues
   - Include screenshots for UI changes
   - Add breaking change notes if applicable

### Commit Message Format

We follow conventional commits:

```
type(scope): description

[optional body]

[optional footer]
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples:**
```
feat(button): add loading state with spinner
fix(datepicker): resolve calendar navigation issue
docs: update installation instructions
style(input): improve focus styles for accessibility
```

## 🧪 Testing

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests in production mode
npm run test:prod
```

### Test Requirements

- **Unit tests** for component logic
- **Integration tests** for component interactions
- **Accessibility tests** using aXe
- **Visual regression tests** (when applicable)

### Writing Tests

- Test component properties and methods
- Test event handling
- Test accessibility features
- Test responsive behavior
- Test theming and customization

## 📚 Documentation

### Component Documentation

Each component should include:

1. **README.md** with:
   - Component description
   - Installation instructions
   - Usage examples
   - API documentation
   - Styling guide

2. **API Documentation:**
   - Properties with types and defaults
   - Events with detail types
   - Methods and return types
   - CSS custom properties

3. **Examples:**
   - Basic usage
   - Advanced configurations
   - Framework integrations
   - Theming examples

### Documentation Standards

- Use clear, concise language
- Provide code examples
- Include accessibility notes
- Document breaking changes
- Keep examples up to date

## 🐛 Bug Reports

When reporting bugs, please include:

1. **Clear description** of the issue
2. **Steps to reproduce** the problem
3. **Expected behavior** vs actual behavior
4. **Environment details:**
   - Browser version
   - Node.js version
   - Component version
   - Framework (if applicable)
5. **Code sample** demonstrating the issue
6. **Screenshots/videos** (if applicable)

## 💡 Feature Requests

For feature requests, please provide:

1. **Clear description** of the desired feature
2. **Use case** and motivation
3. **Proposed API** (if applicable)
4. **Alternative solutions** considered
5. **Additional context** or examples

## 🎨 Design Guidelines

### Accessibility

- Follow WCAG 2.1 AA guidelines
- Ensure keyboard navigation
- Provide proper ARIA attributes
- Support screen readers
- Maintain color contrast ratios

### Responsive Design

- Mobile-first approach
- Touch-friendly targets (44px minimum)
- Flexible layouts
- Appropriate breakpoints

### Theming

- Use CSS custom properties
- Support light/dark themes
- Provide sensible defaults
- Allow full customization

## 🔒 Security

- Report security issues privately
- Don't include sensitive data in public issues
- Follow responsible disclosure practices

## 📞 Getting Help

- **Discussions**: Use GitHub Discussions for questions
- **Issues**: Create issues for bugs and feature requests
- **Discord**: Join our community Discord (coming soon)
- **Email**: Contact maintainers directly for sensitive issues

## 📄 License

By contributing to Nuraly UI, you agree that your contributions will be licensed under the BSD 3-Clause License.

---

Thank you for contributing to Nuraly UI! 🎉
