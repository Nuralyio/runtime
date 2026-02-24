package com.nuraly.conduit.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Database column information.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ColumnDTO {

    /** Column name */
    private String name;

    /** Data type */
    private String type;

    /** Whether column allows null */
    private boolean nullable;

    /** Whether column is primary key */
    private boolean primaryKey;

    /** Default value */
    private String defaultValue;

    /** Column description/comment */
    private String description;

    /** Ordinal position */
    private int ordinalPosition;

    /** Maximum length for string types */
    private Integer maxLength;

    /** Numeric precision */
    private Integer precision;

    /** Numeric scale */
    private Integer scale;
}
