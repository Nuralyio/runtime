package com.nuraly.functions.entity;

import io.quarkus.hibernate.orm.panache.PanacheEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.GenericGenerator;

@Entity
@Table(name = "functions")
@Getter
@Setter
public class FunctionEntity extends PanacheEntity {
    public String label;
    public String description;
    public String template;
    public String runtime;

    @Lob
    @Column(columnDefinition = "TEXT")
    public String handler;
}