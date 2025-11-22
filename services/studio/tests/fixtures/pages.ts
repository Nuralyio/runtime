/**
 * Test fixtures for pages
 */

export const mockHomePage = {
  id: 'page-home',
  name: 'Home',
  path: '/',
  title: 'Home Page',
  components: ['container-1'],
  metadata: {
    description: 'Home page description',
    keywords: ['home', 'landing'],
  },
};

export const mockDashboardPage = {
  id: 'page-dashboard',
  name: 'Dashboard',
  path: '/dashboard',
  title: 'Dashboard',
  components: ['header-1', 'sidebar-1', 'main-content-1'],
  metadata: {
    description: 'Dashboard page',
    requiresAuth: true,
  },
};

export const mockLoginPage = {
  id: 'page-login',
  name: 'Login',
  path: '/login',
  title: 'Login',
  components: ['form-1'],
  metadata: {
    description: 'Login page',
  },
};

export const mockPageWithHandlers = {
  id: 'page-with-handlers',
  name: 'Interactive Page',
  path: '/interactive',
  title: 'Interactive Page',
  components: ['container-1'],
  handlers: {
    onLoad: 'SetVar("pageLoaded", true);',
    onUnload: 'SetVar("pageLoaded", false);',
  },
  metadata: {},
};
