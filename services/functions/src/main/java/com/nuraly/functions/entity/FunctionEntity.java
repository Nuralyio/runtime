package com.nuraly.functions.entity;

import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.GenericGenerator;

import java.util.UUID;

@Entity
@Table(name = "functions")
@Getter
@Setter
public class FunctionEntity extends PanacheEntityBase {
    @Id
    @GeneratedValue(generator = "UUID")
    @GenericGenerator(name = "UUID", strategy = "org.hibernate.id.UUIDGenerator")
    @Column(name = "id", updatable = false, nullable = false)
    public UUID id;

    public String label;
    public String description;
    public String template;
    public String runtime;

    @Lob
    @Column(columnDefinition = "TEXT")
    public String handler;

    @Column(name = "application_id")
    public String applicationId;

    @Column(name = "created_by")
    public String createdBy;
}