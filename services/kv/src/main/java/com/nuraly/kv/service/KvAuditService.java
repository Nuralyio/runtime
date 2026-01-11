package com.nuraly.kv.service;

import com.nuraly.kv.configuration.KvConfiguration;
import com.nuraly.kv.entity.KvAuditLogEntity;
import com.nuraly.kv.entity.enums.KvAuditAction;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import org.jboss.logging.Logger;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.UUID;

@ApplicationScoped
public class KvAuditService {

    private static final Logger LOG = Logger.getLogger(KvAuditService.class);

    @Inject
    KvConfiguration config;

    @Transactional(Transactional.TxType.REQUIRES_NEW)
    public void logAccess(UUID namespaceId, UUID entryId, String keyPath,
                         KvAuditAction action, String userId, boolean success, String errorMessage) {
        if (!config.audit().enabled()) {
            return;
        }

        try {
            KvAuditLogEntity audit = new KvAuditLogEntity();
            audit.namespaceId = namespaceId;
            audit.entryId = entryId;
            audit.keyPath = keyPath;
            audit.action = action;
            audit.userId = userId;
            audit.success = success;
            audit.errorMessage = errorMessage;
            audit.persist();
        } catch (Exception e) {
            LOG.error("Failed to log audit entry", e);
        }
    }

    public void logRead(UUID namespaceId, UUID entryId, String keyPath, String userId, boolean success) {
        logAccess(namespaceId, entryId, keyPath, KvAuditAction.READ, userId, success, null);
    }

    public void logWrite(UUID namespaceId, UUID entryId, String keyPath, String userId, boolean success) {
        logAccess(namespaceId, entryId, keyPath, KvAuditAction.WRITE, userId, success, null);
    }

    public void logDelete(UUID namespaceId, UUID entryId, String keyPath, String userId, boolean success) {
        logAccess(namespaceId, entryId, keyPath, KvAuditAction.DELETE, userId, success, null);
    }

    public void logRotate(UUID namespaceId, UUID entryId, String keyPath, String userId, boolean success) {
        logAccess(namespaceId, entryId, keyPath, KvAuditAction.ROTATE, userId, success, null);
    }

    public void logRollback(UUID namespaceId, UUID entryId, String keyPath, String userId, boolean success) {
        logAccess(namespaceId, entryId, keyPath, KvAuditAction.ROLLBACK, userId, success, null);
    }

    @Transactional
    public long cleanupOldLogs() {
        int retentionDays = config.audit().retentionDays();
        Instant cutoff = Instant.now().minus(retentionDays, ChronoUnit.DAYS);
        return KvAuditLogEntity.delete("createdAt < ?1", cutoff);
    }
}
