package com.nuraly.kv.service;

import com.nuraly.kv.configuration.KvConfiguration;
import com.nuraly.kv.entity.KvEntryEntity;
import io.quarkus.scheduler.Scheduled;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import org.jboss.logging.Logger;

import java.time.Instant;

@ApplicationScoped
public class KvTtlCleanupService {

    private static final Logger LOG = Logger.getLogger(KvTtlCleanupService.class);

    @Inject
    KvConfiguration config;

    @Inject
    KvAuditService auditService;

    @Scheduled(every = "${kv.ttl.cleanup.interval:60s}")
    @Transactional
    public void cleanupExpiredEntries() {
        if (!config.ttl().cleanup().enabled()) {
            return;
        }

        try {
            Instant now = Instant.now();
            long deletedCount = KvEntryEntity.delete("expiresAt is not null and expiresAt < ?1", now);

            if (deletedCount > 0) {
                LOG.info("TTL cleanup: deleted " + deletedCount + " expired entries");
            }
        } catch (Exception e) {
            LOG.error("TTL cleanup failed", e);
        }
    }

    @Scheduled(cron = "0 0 2 * * ?")
    public void cleanupOldAuditLogs() {
        try {
            long deletedCount = auditService.cleanupOldLogs();
            if (deletedCount > 0) {
                LOG.info("Audit cleanup: deleted " + deletedCount + " old audit logs");
            }
        } catch (Exception e) {
            LOG.error("Audit cleanup failed", e);
        }
    }
}
