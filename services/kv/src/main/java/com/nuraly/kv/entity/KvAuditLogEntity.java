package com.nuraly.kv.entity;

import com.nuraly.kv.entity.enums.KvAuditAction;
import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.GenericGenerator;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "kv_audit_logs", indexes = {
    @Index(name = "idx_audit_namespace", columnList = "namespace_id"),
    @Index(name = "idx_audit_entry", columnList = "entry_id"),
    @Index(name = "idx_audit_user", columnList = "user_id"),
    @Index(name = "idx_audit_created", columnList = "created_at")
})
@Getter
@Setter
public class KvAuditLogEntity extends PanacheEntityBase {

    @Id
    @GeneratedValue(generator = "UUID")
    @GenericGenerator(name = "UUID", strategy = "org.hibernate.id.UUIDGenerator")
    public UUID id;

    @Column(name = "namespace_id")
    public UUID namespaceId;

    @Column(name = "entry_id")
    public UUID entryId;

    @Column(name = "key_path", length = 512)
    public String keyPath;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    public KvAuditAction action;

    @Column(name = "user_id")
    public String userId;

    @Column(nullable = false)
    public Boolean success = true;

    @Column(name = "error_message")
    public String errorMessage;

    @Column(name = "ip_address", length = 45)
    public String ipAddress;

    @Column(name = "created_at", nullable = false)
    public Instant createdAt;

    @PrePersist
    public void prePersist() {
        createdAt = Instant.now();
    }
}
