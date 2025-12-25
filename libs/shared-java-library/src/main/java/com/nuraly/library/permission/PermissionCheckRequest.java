package com.nuraly.library.permission;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * DTO for permission check requests to the permissions API.
 * Null fields are not included in JSON serialization to avoid validation errors.
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public class PermissionCheckRequest {

    @JsonProperty("userId")
    private String userId;

    @JsonProperty("permissionType")
    private String permissionType;

    @JsonProperty("resourceType")
    private String resourceType;

    @JsonProperty("resourceId")
    private String resourceId;

    @JsonProperty("applicationId")
    private String applicationId;

    @JsonProperty("granteeType")
    private String granteeType;

    @JsonProperty("anonymous")
    private boolean anonymous;

    public PermissionCheckRequest() {
    }

    public static Builder builder() {
        return new Builder();
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getPermissionType() {
        return permissionType;
    }

    public void setPermissionType(String permissionType) {
        this.permissionType = permissionType;
    }

    public String getResourceType() {
        return resourceType;
    }

    public void setResourceType(String resourceType) {
        this.resourceType = resourceType;
    }

    public String getResourceId() {
        return resourceId;
    }

    public void setResourceId(String resourceId) {
        this.resourceId = resourceId;
    }

    public String getApplicationId() {
        return applicationId;
    }

    public void setApplicationId(String applicationId) {
        this.applicationId = applicationId;
    }

    public String getGranteeType() {
        return granteeType;
    }

    public void setGranteeType(String granteeType) {
        this.granteeType = granteeType;
    }

    public boolean isAnonymous() {
        return anonymous;
    }

    public void setAnonymous(boolean anonymous) {
        this.anonymous = anonymous;
    }

    public static class Builder {
        private final PermissionCheckRequest request = new PermissionCheckRequest();

        public Builder userId(String userId) {
            request.userId = userId;
            return this;
        }

        public Builder permissionType(String permissionType) {
            request.permissionType = permissionType;
            return this;
        }

        public Builder resourceType(String resourceType) {
            request.resourceType = resourceType;
            return this;
        }

        public Builder resourceId(String resourceId) {
            request.resourceId = resourceId;
            return this;
        }

        public Builder applicationId(String applicationId) {
            request.applicationId = applicationId;
            return this;
        }

        public Builder granteeType(GranteeType granteeType) {
            request.granteeType = granteeType != null ? granteeType.getValue() : null;
            return this;
        }

        public Builder anonymous(boolean anonymous) {
            request.anonymous = anonymous;
            return this;
        }

        public PermissionCheckRequest build() {
            return request;
        }
    }
}
