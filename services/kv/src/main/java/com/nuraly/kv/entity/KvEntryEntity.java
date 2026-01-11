package com.nuraly.kv.entity;

import com.nuraly.kv.entity.enums.KvValueType;
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
@Table(name = "kv_entries", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"namespace_id", "key_path"})
})
@Getter
@Setter
@ToString(exclude = {"valueData", "namespace", "versions"})
public class KvEntryEntity extends PanacheEntityBase {

    @Id
    @GeneratedValue(generator = "UUID")
    @GenericGenerator(name = "UUID", strategy = "org.hibernate.id.UUIDGenerator")
    public UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "namespace_id", nullable = false)
    public KvNamespaceEntity namespace;

    @Column(name = "key_path", nullable = false, length = 512)
    public String keyPath;

    @Lob
    @Column(name = "value_data", columnDefinition = "TEXT")
    public String valueData;

    @Enumerated(EnumType.STRING)
    @Column(name = "value_type", nullable = false)
    public KvValueType valueType = KvValueType.STRING;

    @Column(name = "is_encrypted")
    public Boolean isEncrypted = false;

    @Version
    @Column(name = "version")
    public Long version = 1L;

    @Column(name = "expires_at")
    public Instant expiresAt;

    @Lob
    @Column(columnDefinition = "TEXT")
    public String metadata;

    @Column(name = "created_by")
    public String createdBy;

    @Column(name = "updated_by")
    public String updatedBy;

    @OneToMany(mappedBy = "entry", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    public List<KvEntryVersionEntity> versions = new ArrayList<>();

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
