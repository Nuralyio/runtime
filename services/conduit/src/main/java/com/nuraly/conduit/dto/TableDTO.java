package com.nuraly.conduit.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Database table/view information.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TableDTO {

    /** Table name */
    private String name;

    /** Schema name */
    private String schema;

    /** Type: table, view, collection */
    private String type;

    /** Approximate row count */
    private Long rowCount;

    /** Table description/comment */
    private String description;
}
