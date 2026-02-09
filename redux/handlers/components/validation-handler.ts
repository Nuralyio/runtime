import { validateComponentHandlers } from '../../../utils/handler-validator';
import { eventDispatcher } from '../../../utils/change-detection.ts';

function formatValidationErrors(errors: any[]): string {
  if (errors.length === 0) return "";

  if (errors.length === 1) {
    return `Security violation: ${errors[0].message}`;
  }

  return `Found ${errors.length} security violations:\n${errors.map((e, i) =>
    `${i + 1}. ${e.code || 'Handler'}: ${e.message}`
  ).join('\n')}`;
}

export const validateAndEmitErrors = (component: any) => {
  const validationResult = validateComponentHandlers(component);

  if (!validationResult.valid) {
    const errorMessage = formatValidationErrors(validationResult.errors);

    eventDispatcher.emit("kernel:log", {
      type: "error",
      message: "Handler Validation Failed",
      details: errorMessage,
      errors: validationResult.errors
    });

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

  return null;
};
