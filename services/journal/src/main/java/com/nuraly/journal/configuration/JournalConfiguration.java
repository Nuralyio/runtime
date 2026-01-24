package com.nuraly.journal.configuration;

import jakarta.inject.Singleton;
import org.eclipse.microprofile.config.inject.ConfigProperty;

import java.util.Optional;

/**
 * Configuration properties for the Journal service.
 */
@Singleton
public class JournalConfiguration {

    @ConfigProperty(name = "journal.retention.days", defaultValue = "30")
    public int retentionDays;

    @ConfigProperty(name = "journal.batch.max-size", defaultValue = "1000")
    public int batchMaxSize;

    @ConfigProperty(name = "journal.websocket.enabled", defaultValue = "true")
    public boolean websocketEnabled;

    @ConfigProperty(name = "permission.api.base-url", defaultValue = "http://api:8000/api")
    public String permissionApiBaseUrl;

    @ConfigProperty(name = "permissions.enabled", defaultValue = "true")
    public boolean permissionsEnabled;
}
