/**
 * Page Management Functions
 * 
 * Operations for creating, updating, and deleting pages.
 */

import { addPageHandler, updatePageHandler } from '../../redux/handlers/pages/handler';
import { deletePageAction } from '../../redux/actions/page/deletePageAction';
import type { PageElement } from '../../redux/handlers/pages/page.interface';

export function createPageFunctions() {
  return {
    /**
     * Adds a new page
     */
    AddPage: (page: any): Promise<any> => {
      return new Promise((resolve) => {
        addPageHandler(page, (page: any) => {
          resolve(page);
        });
      });
    },

    /**
     * Updates an existing page
     */
    UpdatePage: (page: any): Promise<any> => {
      return new Promise((resolve) => {
        updatePageHandler(page, (page) => {
          resolve(page);
        });
      });
    },

    /**
     * Deletes a page with confirmation
     */
    deletePage: (page: PageElement) => {
      const userInput = confirm("Are you sure you want to delete this page?");
      if (userInput) {
        deletePageAction(page);
      }
    },
  };
}
