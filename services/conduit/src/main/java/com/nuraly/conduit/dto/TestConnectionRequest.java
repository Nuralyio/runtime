package com.nuraly.conduit.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request for testing a database connection inline (without saving to KV).
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TestConnectionRequest {

    /** Database type */
    private String type;

    /** Host */
    private String host;

    /** Port */
    private int port;

    /** Database name */
    private String database;

    /** Username */
    private String username;

    /** Password */
    private String password;

    /** SSL enabled */
    private Boolean ssl;

    /** SSL mode */
    private String sslMode;

    /**
     * Convert to DatabaseCredential.
     */
    public DatabaseCredential toCredential() {
        return DatabaseCredential.builder()
                .type(type)
                .host(host)
                .port(port)
                .database(database)
                .username(username)
                .password(password)
                .ssl(ssl)
                .sslMode(sslMode)
                .build();
    }
}
