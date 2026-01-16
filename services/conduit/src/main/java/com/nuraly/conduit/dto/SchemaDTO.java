package com.nuraly.conduit.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Database schema information.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SchemaDTO {

    /** Schema name */
    private String name;

    /** Number of tables in schema */
    private int tableCount;

    /** Schema owner */
    private String owner;
}
