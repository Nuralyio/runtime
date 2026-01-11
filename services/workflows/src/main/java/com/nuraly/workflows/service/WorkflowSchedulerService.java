package com.nuraly.workflows.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.nuraly.workflows.entity.WorkflowTriggerEntity;
import com.nuraly.workflows.entity.enums.TriggerType;
import com.nuraly.workflows.entity.enums.WorkflowStatus;
import io.quarkus.scheduler.Scheduled;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;

import java.util.List;

@ApplicationScoped
public class WorkflowSchedulerService {

    @Inject
    WorkflowTriggerService triggerService;

    private final ObjectMapper objectMapper = new ObjectMapper();

    /**
     * Check for scheduled triggers every minute.
     * In a production system, this would use Quartz for more precise scheduling.
     */
    @Scheduled(every = "60s")
    @Transactional
    void checkScheduledTriggers() {
        List<WorkflowTriggerEntity> scheduledTriggers = WorkflowTriggerEntity.list(
                "type = ?1 and enabled = true and workflow.status = ?2",
                TriggerType.SCHEDULE, WorkflowStatus.ACTIVE);

        for (WorkflowTriggerEntity trigger : scheduledTriggers) {
            if (shouldExecute(trigger)) {
                try {
                    JsonNode payload = objectMapper.createObjectNode();
                    triggerService.triggerByEvent(trigger, payload);
                } catch (Exception e) {
                    System.err.println("Failed to execute scheduled trigger " + trigger.id + ": " + e.getMessage());
                }
            }
        }
    }

    private boolean shouldExecute(WorkflowTriggerEntity trigger) {
        // Parse configuration to get cron expression
        // For simplicity, this checks if the trigger should run now
        // In production, use a proper cron library like cron-utils
        if (trigger.configuration == null) {
            return false;
        }

        try {
            JsonNode config = objectMapper.readTree(trigger.configuration);
            String cronExpression = config.has("cron") ? config.get("cron").asText() : null;

            if (cronExpression == null) {
                return false;
            }

            // Simple implementation: check last triggered time
            // If never triggered or more than interval has passed, execute
            if (trigger.lastTriggeredAt == null) {
                return true;
            }

            // For a basic implementation, support simple intervals
            if (config.has("intervalMinutes")) {
                int intervalMinutes = config.get("intervalMinutes").asInt();
                long minutesSinceLastTrigger = java.time.Duration.between(
                        trigger.lastTriggeredAt, java.time.Instant.now()).toMinutes();
                return minutesSinceLastTrigger >= intervalMinutes;
            }

            return false;
        } catch (Exception e) {
            System.err.println("Failed to parse trigger configuration: " + e.getMessage());
            return false;
        }
    }
}
