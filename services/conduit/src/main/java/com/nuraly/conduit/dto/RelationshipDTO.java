package com.nuraly.conduit.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Database foreign key relationship information.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RelationshipDTO {

    /** Constraint name */
    private String name;

    /** Source column name */
    private String sourceColumn;

    /** Target table name */
    private String targetTable;

    /** Target schema name */
    private String targetSchema;

    /** Target column name */
    private String targetColumn;

    /** Relationship type: one-to-one, one-to-many, many-to-many */
    private String type;

    /** ON DELETE action */
    private String onDelete;

    /** ON UPDATE action */
    private String onUpdate;
}
