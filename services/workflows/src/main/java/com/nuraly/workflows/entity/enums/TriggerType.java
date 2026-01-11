package com.nuraly.workflows.entity.enums;

public enum TriggerType {
    WEBHOOK,    // HTTP webhook trigger
    SCHEDULE,   // Cron-based schedule
    EVENT       // Internal event (from RabbitMQ)
}
