# Nuraly Frontend

A modern, visual web application builder and runtime platform built with Astro, Lit, and TypeScript. Nuraly provides a powerful drag-and-drop interface for creating dynamic web applications without traditional coding.

## 🚀 Overview

Nuraly is a low-code/no-code platform that enables users to build web applications through a visual interface. It features a component-based architecture with real-time editing capabilities, micro-application support, and a comprehensive design system.

## 🏗️ Architecture

### Core Architecture Patterns

- **Component-Based Architecture**: Built on Web Components using Lit for maximum reusability and encapsulation
- **Micro-Frontend Pattern**: Applications are composed of micro-apps that can be independently developed and deployed
- **Reactive State Management**: Uses Nanostores for lightweight, reactive state management
- **Server-Side Rendering**: Astro provides optimal performance with selective hydration
- **Event-Driven Design**: Components communicate through a centralized event system

### Technology Stack

- **Frontend Framework**: [Astro](https://astro.build/) (v4.16.14) - Modern static site generator with SSR
- **Component Library**: [Lit](https://lit.dev/) (v3.1.4) - Lightweight web components
- **UI Framework**: React (v18.2.0) for complex interactive components
- **Styling**: Tailwind CSS (v3.4.1) for utility-first CSS
- **State Management**: [Nanostores](https://github.com/nanostores/nanostores) for reactive state
- **Code Editor**: Monaco Editor for in-browser code editing
- **Build Tool**: Vite with custom configurations

## 📁 Project Structure

```
frontend/
├── src/
│   ├── core/                      # Core system modules
│   │   ├── Kernel.ts              # Central execution engine
│   │   ├── Editor.ts              # Visual editor core
│   │   ├── micro-app.ts           # Micro-application runtime
│   │   ├── Navigation.ts          # Routing and navigation
│   │   └── kernel/                # Kernel subsystems
│   │
│   ├── pages/                     # Astro pages and routing
│   │   ├── _index.astro           # Homepage
│   │   ├── app/                   # Application routes
│   │   │   ├── studio/            # Visual editor interface
│   │   │   └── view/              # Application preview
│   │   └── _layouts/              # Page layouts
│   │
│   ├── shared/                    # Reusable components
│   │   ├── components/            # UI component library
│   │   │   ├── BaseElement.ts     # Base component class
│   │   │   ├── Button/            # Button components
│   │   │   ├── Containers/        # Layout containers
│   │   │   ├── Collections/       # Data collections
│   │   │   └── ...               # Other UI components
│   │   └── wrappers/              # Component wrappers
│   │
│   ├── store/                     # State management
│   │   ├── apps.ts                # Application state
│   │   ├── component/             # Component state
│   │   ├── page.ts                # Page state
│   │   ├── context.ts             # Global context
│   │   └── actions/               # State actions
│   │
│   ├── services/                  # API and business logic
│   │   ├── applications.service.ts
│   │   ├── component.service.ts
│   │   └── page.service.ts
│   │
│   └── utils/                     # Utility functions
│       ├── render-util.ts         # Component rendering
│       ├── api-calls-utils.ts     # API utilities
│       └── ...                   # Other utilities
│
├── public/                        # Static assets
├── astro.config.mjs              # Astro configuration
├── package.json                  # Dependencies and scripts
├── tailwind.config.cjs           # Tailwind configuration
└── tsconfig.json                 # TypeScript configuration
```

## 🎯 Design Patterns

### 1. Component-Based Architecture

- **BaseElement Pattern**: All components extend `BaseElementBlock` for consistent behavior
- **Composition over Inheritance**: Components are composed of smaller, reusable parts
- **Props-Down Events-Up**: Data flows down through properties, events bubble up

### 2. Micro-Application Pattern

- **Isolated Applications**: Each app runs independently with its own state
- **Shared Runtime**: Common kernel provides shared services
- **Dynamic Loading**: Applications and components are loaded on-demand

### 3. State Management Patterns

- **Reactive Stores**: Nanostores provide reactive state with minimal boilerplate
- **Immutable Updates**: State updates use immutable patterns for predictability
- **Scoped State**: Each micro-app maintains its own state scope

### 4. Event-Driven Architecture

- **Central Event Bus**: Components communicate through a centralized event system
- **Loose Coupling**: Components are decoupled through event-based communication
- **Change Detection**: Automated change detection triggers UI updates

### 5. Builder Pattern

- **Visual Composition**: Drag-and-drop interface for building applications
- **Component Registry**: Centralized component registration and discovery
- **Property Panels**: Dynamic property editing based on component schemas

## 🏃‍♂️ Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn package manager

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run server       # Start production server
npm run astro        # Run Astro CLI commands
```

## 🧩 Core Concepts

### Components

Components are the building blocks of Nuraly applications. Each component:

- Extends `BaseElementBlock` for consistent behavior
- Has properties for configuration and styling
- Supports event handlers for interactions
- Can contain child components for composition

### Applications

Applications in Nuraly are collections of pages and components that work together:

- Self-contained with their own state
- Can be embedded as micro-apps
- Support routing and navigation
- Have independent styling and theming

### Pages

Pages are the screens within an application:

- Contain component hierarchies
- Support dynamic routing
- Have configurable layouts
- Can pass data between components

### Kernel

The Kernel is the core execution engine that:

- Manages component lifecycle
- Handles state synchronization
- Processes events and interactions
- Provides runtime services

## 🎨 Styling and Theming

### Design System

- **Custom Components**: @nuralyui component library
- **CSS Variables**: Dynamic theming support
- **Responsive Design**:
## 🔧 Development

### Adding New Components

1. Create component in `src/shared/components/`
2. Extend `BaseElementBlock`
3. Define properties and events
4. Register in component registry
5. Add to studio panels

### Creating New Pages

1. Add Astro file in `src/pages/`
2. Import required components
3. Set up state management
4. Configure routing if needed

### State Management

Use Nanostores for reactive state:

```typescript
import { atom } from 'nanostores';

export const $myState = atom(initialValue);

// Update state
$myState.set(newValue);

// Subscribe to changes
$myState.subscribe(value => {
  // Handle state change
});
```

## 📦 Build and Deployment

### Production Build

```bash
npm run build
```

### Docker Support

```bash
# Build Docker image
./build-image.sh

# Run with Docker Compose
docker-compose up
```

### Environment Variables

Configure environment variables for:

- API endpoints
- Feature flags
- Application UUIDs
- Build configurations

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙋‍♂️ Support

For questions and support:

- Check the documentation
- Open an issue on GitHub
- Contact the development team

---

Built with ❤️ by the Nuraly team
