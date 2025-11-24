---
sidebar_position: 2
title: Architecture
description: Understanding Nuraly's architectural patterns and design principles
---

# Architecture

This section covers the architectural patterns, design principles, and technical implementation details of the Nuraly platform.

## Overview

Nuraly is built on a modern, scalable architecture that emphasizes:

- **Modularity** - Independent, composable micro-apps
- **Isolation** - Sandboxed execution environments
- **Reactivity** - Efficient state management and updates
- **Flexibility** - Extensible component system

## Core Concepts

### Micro-Apps

Micro-apps are self-contained, isolated applications that can be embedded and run independently. Each micro-app has:

- Its own component tree
- Isolated runtime context
- Independent state management
- Sandboxed handler execution

### Variable Scopes

The [Variable Scope System](./micro-apps/variable-scopes.md) provides two-tier state management:

- **LOCAL** - Isolated per micro-app instance
- **GLOBAL** - Shared across all instances

### Component System

Components are the building blocks of Nuraly applications, featuring:

- Reactive properties
- Event handling
- Custom styling
- Dynamic rendering

## Architecture Sections

<div className="row">
  <div className="col col--6">
    <div className="card">
      <div className="card__header">
        <h3>🎯 Micro-Apps</h3>
      </div>
      <div className="card__body">
        <p>
          Learn about the micro-app architecture, including variable scopes,
          component isolation, and runtime contexts.
        </p>
      </div>
      <div className="card__footer">
        <a href="./micro-apps/variable-scopes" className="button button--primary button--block">
          Variable Scopes
        </a>
      </div>
    </div>
  </div>

  <div className="col col--6">
    <div className="card">
      <div className="card__header">
        <h3>🔧 Components</h3>
      </div>
      <div className="card__body">
        <p>
          Explore the component system, custom components, and how to build
          interactive UI elements.
        </p>
      </div>
      <div className="card__footer">
        <a href="#" className="button button--secondary button--block">
          Coming Soon
        </a>
      </div>
    </div>
  </div>
</div>

<div className="row" style={{marginTop: '1rem'}}>
  <div className="col col--6">
    <div className="card">
      <div className="card__header">
        <h3>⚡ Runtime System</h3>
      </div>
      <div className="card__body">
        <p>
          Understand handler execution, event dispatching, and the reactive
          runtime environment.
        </p>
      </div>
      <div className="card__footer">
        <a href="#" className="button button--secondary button--block">
          Coming Soon
        </a>
      </div>
    </div>
  </div>

  <div className="col col--6">
    <div className="card">
      <div className="card__header">
        <h3>🔒 Security</h3>
      </div>
      <div className="card__body">
        <p>
          Learn about sandboxing, code validation, and security best practices
          in Nuraly applications.
        </p>
      </div>
      <div className="card__footer">
        <a href="#" className="button button--secondary button--block">
          Coming Soon
        </a>
      </div>
    </div>
  </div>
</div>

## Key Features

### 🎨 Component-Based

Build applications from reusable, composable components with reactive properties and event handling.

### 🔄 State Management

Flexible two-tier variable scoping system allowing both isolated and shared state across micro-apps.

### 🛡️ Sandboxed Execution

Handler code runs in isolated contexts with controlled access to runtime APIs for enhanced security.

### ⚡ Performance

Efficient reactivity system with smart caching, event batching, and optimized component updates.

### 🔌 Extensible

Plugin-based architecture supporting custom components, handlers, and runtime extensions.

## Getting Started

1. **Understand Variable Scopes** - Start with the [Variable Scope System](./micro-apps/variable-scopes.md) to learn how state management works
2. **Explore Components** - Learn about the component system and how to build UI elements
3. **Study Runtime** - Deep dive into handler execution and the runtime environment
4. **Apply Security** - Implement best practices for secure application development

## Architecture Principles

### Isolation

Each micro-app instance maintains complete isolation from others, preventing unintended side effects and enabling independent development.

### Composability

Components and micro-apps can be freely composed and nested to build complex applications from simple building blocks.

### Reactivity

Changes to variables and properties automatically trigger updates throughout the component tree with minimal manual intervention.

### Developer Experience

Clear APIs, comprehensive documentation, and helpful error messages make building with Nuraly straightforward and productive.

## Next Steps

- Dive deep into [Variable Scopes](./micro-apps/variable-scopes.md)
- Check out the [Getting Started Guide](../intro)
- Browse the [API Reference](#) (coming soon)
