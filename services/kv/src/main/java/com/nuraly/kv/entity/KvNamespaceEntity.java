package com.nuraly.kv.entity;

import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;
import org.hibernate.annotations.GenericGenerator;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "kv_namespaces", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"name", "application_id"})
})
@Getter
@Setter
@ToString(exclude = {"entries"})
public class KvNamespaceEntity extends PanacheEntityBase {

    @Id
    @GeneratedValue(generator = "UUID")
    @GenericGenerator(name = "UUID", strategy = "org.hibernate.id.UUIDGenerator")
    public UUID id;

    @Column(nullable = false, length = 128)
    public String name;

    @Lob
    @Column(columnDefinition = "TEXT")
    public String description;

    @Column(name = "application_id")
    public String applicationId;

    @Column(name = "is_secret_namespace")
    public Boolean isSecretNamespace = false;

    @Column(name = "default_ttl_seconds")
    public Long defaultTtlSeconds;

    @Column(name = "created_by")
    public String createdBy;

    @Column(name = "updated_by")
    public String updatedBy;

    @OneToMany(mappedBy = "namespace", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    public List<KvEntryEntity> entries = new ArrayList<>();

    @Column(name = "created_at")
    public Instant createdAt;

    @Column(name = "updated_at")
    public Instant updatedAt;

    @PrePersist
    public void prePersist() {
        createdAt = Instant.now();
        updatedAt = Instant.now();
    }

    @PreUpdate
    public void preUpdate() {
        updatedAt = Instant.now();
    }
}
