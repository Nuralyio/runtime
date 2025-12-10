/**
 * Application Management Functions
 * 
 * Operations for updating applications.
 */

import { updateApplication as updateSepecificApplication } from '../../redux/actions/application';

export function createApplicationFunctions() {
  return {
    /**
     * Updates an application
     */
    UpdateApplication: (application) => {
      updateSepecificApplication(application);
    },
  };
}
