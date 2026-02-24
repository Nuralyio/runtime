package com.nuraly.conduit.service;

import jakarta.enterprise.context.ApplicationScoped;
import org.eclipse.microprofile.config.inject.ConfigProperty;
import org.jboss.logging.Logger;

import java.net.InetAddress;
import java.net.UnknownHostException;
import java.util.Arrays;
import java.util.Collections;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Validates database hostnames against a configurable blocklist.
 * Prevents connections to internal/sensitive hosts (e.g., localhost, metadata endpoints).
 */
@ApplicationScoped
public class HostValidationService {

    private static final Logger LOG = Logger.getLogger(HostValidationService.class);

    private final Set<String> blockedHosts;

    public HostValidationService(
            @ConfigProperty(name = "db.blocked-hosts", defaultValue = "none") String blockedHostsConfig) {
        if (blockedHostsConfig == null || blockedHostsConfig.isBlank() || "none".equals(blockedHostsConfig)) {
            this.blockedHosts = Collections.emptySet();
        } else {
            this.blockedHosts = Arrays.stream(blockedHostsConfig.split(","))
                    .map(String::trim)
                    .filter(s -> !s.isEmpty())
                    .map(String::toLowerCase)
                    .collect(Collectors.toUnmodifiableSet());
        }
        if (!this.blockedHosts.isEmpty()) {
            LOG.infof("Host validation enabled with %d blocked hosts", this.blockedHosts.size());
        }
    }

    /**
     * Validates that the given host is not in the blocklist.
     * Checks both the literal hostname and its resolved IP addresses.
     *
     * @param host the hostname or IP to validate
     * @throws IllegalArgumentException if the host is blocked
     */
    public void validateHost(String host) {
        if (host == null || host.isBlank()) {
            throw new IllegalArgumentException("Host must not be empty");
        }

        if (blockedHosts.isEmpty()) {
            return;
        }

        String normalizedHost = host.trim().toLowerCase();

        // Check literal hostname
        if (blockedHosts.contains(normalizedHost)) {
            throw new IllegalArgumentException("Connection to host '" + host + "' is not allowed");
        }

        // Resolve and check IP addresses
        try {
            InetAddress[] addresses = InetAddress.getAllByName(host);
            for (InetAddress addr : addresses) {
                String ip = addr.getHostAddress().toLowerCase();
                if (blockedHosts.contains(ip)) {
                    throw new IllegalArgumentException("Connection to host '" + host + "' is not allowed");
                }
            }
        } catch (UnknownHostException e) {
            // If we can't resolve, let the database driver handle the error
            LOG.debugf("Could not resolve host '%s' for validation: %s", host, e.getMessage());
        }
    }
}
