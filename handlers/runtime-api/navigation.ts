/**
 * Navigation Functions
 * 
 * Functions for navigating between pages and URLs.
 */

import { ExecuteInstance } from '../../state';

export function createNavigationFunctions() {
  return {
    /**
     * Navigates to a URL
     */
    NavigateToUrl: (url: string): void => {
      window.location.href = url;
      ExecuteInstance.Event?.preventDefault?.();
      ExecuteInstance.Event?.stopPropagation?.();
    },

    /**
     * Navigates to a hash anchor and scrolls to it
     */
    NavigateToHash: (hash: string): void => {
      window.location.hash = hash;
      if (hash) {
        const element = document.querySelector(hash);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }
      ExecuteInstance.Event?.preventDefault?.();
      ExecuteInstance.Event?.stopPropagation?.();
    },

    /**
     * Navigates to a page by name within the current application
     */
    NavigateToPage: (pageName: string): void => {
      ExecuteInstance.Event?.preventDefault?.();
      ExecuteInstance.Event?.stopPropagation?.();
      const currentEditingApplication = ExecuteInstance.GetVar("currentEditingApplication");
      const appPages = ExecuteInstance.GetContextVar(
        currentEditingApplication?.uuid + ".appPages",
        currentEditingApplication?.uuid
      );
      const targetPage = appPages?.find((pageItem: any) => pageItem.name === pageName);
      if (targetPage) {
        ExecuteInstance.VarsProxy.currentPage = targetPage.uuid;
      }
    },
  };
}
