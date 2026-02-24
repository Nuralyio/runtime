import { addons } from '@storybook/manager-api';

addons.setConfig({
  sidebar: {
    // Expand all categories by default
    showRoots: true,
    collapsedRoots: [], // Empty array means all categories are expanded
  },
  // Optional: Customize toolbar
  toolbar: {
    title: { hidden: false },
    zoom: { hidden: false },
    eject: { hidden: false },
    copy: { hidden: false },
    fullscreen: { hidden: false },
  },
});
