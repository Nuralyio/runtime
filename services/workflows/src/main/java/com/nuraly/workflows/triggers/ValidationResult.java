package com.nuraly.workflows.triggers;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

/**
 * Result of trigger configuration validation.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ValidationResult {

    private boolean valid;
    private List<String> errors;
    private List<String> warnings;

    public static ValidationResult valid() {
        return new ValidationResult(true, new ArrayList<>(), new ArrayList<>());
    }

    public static ValidationResult invalid(String error) {
        List<String> errors = new ArrayList<>();
        errors.add(error);
        return new ValidationResult(false, errors, new ArrayList<>());
    }

    public static ValidationResult invalid(List<String> errors) {
        return new ValidationResult(false, errors, new ArrayList<>());
    }

    public ValidationResult addError(String error) {
        if (this.errors == null) {
            this.errors = new ArrayList<>();
        }
        this.errors.add(error);
        this.valid = false;
        return this;
    }

    public ValidationResult addWarning(String warning) {
        if (this.warnings == null) {
            this.warnings = new ArrayList<>();
        }
        this.warnings.add(warning);
        return this;
    }

    public boolean hasWarnings() {
        return warnings != null && !warnings.isEmpty();
    }
}
