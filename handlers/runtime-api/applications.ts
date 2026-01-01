/**
 * Application Management Functions
 *
 * Operations for updating and deleting applications.
 */

import { updateSepecificApplication } from '../../redux/actions/application/updateApplication';
import { deleteApplicationAction } from '../../redux/handlers/applications/handler';

export function createApplicationFunctions() {
  return {
    /**
     * Updates an application
     */
    UpdateApplication: (application) => {
      updateSepecificApplication(application);
    },

    /**
     * Deletes an application by ID
     * @param applicationId - The UUID of the application to delete
     * @returns Promise that resolves when deletion is complete
     */
    DeleteApplication: (applicationId: string): Promise<any> => {
      return deleteApplicationAction(applicationId);
    },
  };
}
