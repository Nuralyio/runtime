import { FRONT_API_URLS } from "@shared/redux/handlers/api-urls";
import { validateComponentHandlers } from "@shared/utils/handler-validator";
import { eventDispatcher } from "@shared/utils/change-detection";

export const updateComponentHandler = (component: any, application_id) => {
  // Validate handlers before saving
  const validationResult = validateComponentHandlers(component);

  if (!validationResult.valid) {
    // Emit validation errors
    const errorMessage = formatValidationErrors(validationResult.errors);

    // Emit to console for debugging
    eventDispatcher.emit("kernel:log", {
      type: "error",
      message: "Handler Validation Failed",
      details: errorMessage,
      errors: validationResult.errors
    });

    // Emit validation error event for UI notifications
    eventDispatcher.emit("component:validation-error", {
      componentId: component.uuid,
      errors: validationResult.errors,
      message: errorMessage
    });

    console.error("Handler validation failed:", validationResult.errors);
    return Promise.reject({
      type: "validation_error",
      message: errorMessage,
      errors: validationResult.errors
    });
  }

  const ucomponent = { ...component };
  delete ucomponent.parent
  delete ucomponent.children
  delete ucomponent.childrens
  fetch(`${FRONT_API_URLS.COMPONENTS}/${ucomponent.uuid}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      component: { ...ucomponent, application_id }
    })
  }).then(res => res.json())
    .catch((err) => {
      // Dispatch error
      eventDispatcher.emit("component:save-error", {
        componentId: component.uuid,
        error: err.message || "Failed to save component"
      });

      console.error(err);
    });
};

function formatValidationErrors(errors: any[]): string {
  if (errors.length === 0) return "";

  if (errors.length === 1) {
    return `Security violation: ${errors[0].message}`;
  }

  return `Found ${errors.length} security violations:\n${errors.map((e, i) =>
    `${i + 1}. ${e.code || 'Handler'}: ${e.message}`
  ).join('\n')}`;
}
