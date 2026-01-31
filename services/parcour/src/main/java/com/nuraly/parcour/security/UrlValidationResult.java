package com.nuraly.parcour.security;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UrlValidationResult {

    private boolean valid;
    private String reason;

    public static UrlValidationResult ok() {
        return UrlValidationResult.builder()
                .valid(true)
                .build();
    }

    public static UrlValidationResult invalid(String reason) {
        return UrlValidationResult.builder()
                .valid(false)
                .reason(reason)
                .build();
    }
}
