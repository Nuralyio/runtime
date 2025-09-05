![GitHub Workflow Status](https://img.shields.io/github/actions/workflow/status/hybridui/hybridui/node.js.yml)

# Introduction

Welcome to the Hybrid UI library - the ultimate toolkit for building beautiful and responsive user interfaces with any web framework or as standalone web components. Our library offers a comprehensive set of UI components and styles that can be easily integrated into your Angular, React, or any other web project, or used as web components in any environment.

Our library features a wide range of components, including forms, grids, charts, and much more. All components are built with performance and accessibility in mind and are highly customizable, allowing you to create unique and engaging experiences for your users.

Built with modern front-end technologies like TypeScript and Webcomponent, our library is designed to be flexible, extendable, and easy to use. Whether you're building a small website or a complex enterprise application, our library provides the building blocks you need to create stunning user interfaces quickly and easily.

Our web components are built with the latest web standards and can be used in any environment, making it easy to create reusable components across your entire project. Our documentation provides detailed instructions on how to use our components as web components, as well as how to integrate them into your Angular, React, or any other web project.

At Hybrid, we're passionate about helping developers create exceptional user experiences. If you have any questions or feedback, our dedicated support team is always here to help. Thank you for choosing Hybrid - we can't wait to see what you'll build!

### Installation

```
$ yarn
```

### Local Development

```
$ yarn start
```

This command starts a local development server and opens up a browser window. Most changes are reflected live without having to restart the server.

### Build

```
$ yarn build
```

This command generates static content into the `build` directory and can be served using any static contents hosting service.

### Deployment

Using SSH:

```
$ USE_SSH=true yarn deploy
```

Not using SSH:

```
$ GIT_USER=<Your GitHub username> yarn deploy
```

If you are using GitHub pages for hosting, this command is a convenient way to build the website and push to the `gh-pages` branch.
