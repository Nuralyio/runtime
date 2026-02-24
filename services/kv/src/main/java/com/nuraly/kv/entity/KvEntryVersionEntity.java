package com.nuraly.kv.entity;

import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;
import org.hibernate.annotations.GenericGenerator;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "kv_entry_versions")
@Getter
@Setter
@ToString(exclude = {"valueData", "entry"})
public class KvEntryVersionEntity extends PanacheEntityBase {

    @Id
    @GeneratedValue(generator = "UUID")
    @GenericGenerator(name = "UUID", strategy = "org.hibernate.id.UUIDGenerator")
    public UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "entry_id", nullable = false)
    public KvEntryEntity entry;

    @Column(name = "version", nullable = false)
    public Long version;

    @Lob
    @Column(name = "value_data", columnDefinition = "TEXT")
    public String valueData;

    @Column(name = "changed_by")
    public String changedBy;

    @Column(name = "change_reason", length = 64)
    public String changeReason;

    @Column(name = "created_at")
    public Instant createdAt;

    @PrePersist
    public void prePersist() {
        createdAt = Instant.now();
    }
}
