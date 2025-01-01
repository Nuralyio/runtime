package com.nuraly.library.permission;

import jakarta.enterprise.context.ApplicationScoped;

@ApplicationScoped
public class PermissionService {

    public boolean hasPermission(String userId, String permission) {
        // Implement your permission logic here
        // Example: Fetch user permissions from database or cache
        return false; // Replace with actual logic
    }
}