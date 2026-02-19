package com.nuraly.workflows.entity.enums;

public enum TriggerType {
    // Standard triggers
    WEBHOOK,    // HTTP webhook trigger
    SCHEDULE,   // Cron-based schedule
    EVENT,      // Internal event (from RabbitMQ)

    // Persistent/Long-running triggers
    TELEGRAM_BOT,       // Telegram long-polling or webhook
    SLACK_SOCKET,       // Slack Socket Mode (WebSocket)
    DISCORD_BOT,        // Discord Gateway (WebSocket)
    WHATSAPP_WEBHOOK,   // WhatsApp Business API webhook
    CUSTOM_WEBSOCKET,   // Generic WebSocket listener
    MCP                 // MCP server persistent connection
}
