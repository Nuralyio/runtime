package com.nuraly.functions.entity;

import io.quarkus.hibernate.orm.panache.PanacheEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.GenericGenerator;

import java.util.UUID;

@Entity
@Table(name = "categories")
@Getter
@Setter
public class FunctionEntity  extends PanacheEntity {
    public String label;
    public String description;
    public String template;
    public String runtime;
    public String handler;

}
