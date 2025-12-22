package com.nuraly.library.permission;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;
import java.util.ArrayList;

/**
 * User model matching the API service NUser interface.
 * Represents the authenticated user from the X-USER header.
 */
@JsonIgnoreProperties(ignoreUnknown = true)
public class NUser {

    @JsonProperty("uuid")
    private String uuid;

    @JsonProperty("username")
    private String username;

    @JsonProperty("email")
    private String email;

    @JsonProperty("roles")
    private List<String> roles = new ArrayList<>();

    @JsonProperty("anonymous")
    private boolean anonymous;

    public NUser() {
    }

    public NUser(String uuid) {
        this.uuid = uuid;
        this.anonymous = false;
    }

    public static NUser anonymous() {
        NUser user = new NUser();
        user.anonymous = true;
        return user;
    }

    public String getUuid() {
        return uuid;
    }

    public void setUuid(String uuid) {
        this.uuid = uuid;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public List<String> getRoles() {
        return roles;
    }

    public void setRoles(List<String> roles) {
        this.roles = roles;
    }

    public boolean isAnonymous() {
        return anonymous;
    }

    public void setAnonymous(boolean anonymous) {
        this.anonymous = anonymous;
    }

    public boolean hasRole(String role) {
        return roles != null && roles.contains(role);
    }

    @Override
    public String toString() {
        return "NUser{" +
                "uuid='" + uuid + '\'' +
                ", username='" + username + '\'' +
                ", email='" + email + '\'' +
                ", anonymous=" + anonymous +
                '}';
    }
}
