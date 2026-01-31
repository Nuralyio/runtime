package com.nuraly.workflows.crawl;

import jakarta.enterprise.context.ApplicationScoped;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.net.InetAddress;
import java.net.URI;
import java.net.UnknownHostException;
import java.util.Set;
import java.util.regex.Pattern;

/**
 * URL Security Validator - Prevents SSRF attacks by blocking dangerous URLs.
 *
 * Blocks:
 * - Private IP ranges (10.x, 172.16-31.x, 192.168.x)
 * - Localhost (127.0.0.1, localhost, ::1)
 * - Link-local addresses (169.254.x.x - AWS metadata!)
 * - Internal service hostnames
 * - Non-HTTP protocols
 */
@ApplicationScoped
public class UrlSecurityValidator {

    private static final Logger log = LoggerFactory.getLogger(UrlSecurityValidator.class);

    // Internal hostnames to block (common Docker/K8s service names)
    private static final Set<String> BLOCKED_HOSTNAMES = Set.of(
            "localhost",
            "postgres", "postgresql", "db", "database",
            "redis", "cache",
            "rabbitmq", "rabbit", "mq", "amqp",
            "minio", "s3", "storage",
            "elasticsearch", "elastic", "es",
            "mongodb", "mongo",
            "mysql", "mariadb",
            "kafka", "zookeeper",
            "consul", "etcd", "vault",
            "grafana", "prometheus", "jaeger",
            "nginx", "traefik", "envoy",
            "api", "backend", "frontend", "app",
            "internal", "private", "admin"
    );

    // Patterns for blocked hostnames
    private static final Pattern INTERNAL_PATTERN = Pattern.compile(
            "^(.*\\.)?(internal|local|private|corp|intranet|lan)$",
            Pattern.CASE_INSENSITIVE
    );

    /**
     * Validate a URL for safe crawling.
     *
     * @param url The URL to validate
     * @return ValidationResult with success/failure and reason
     */
    public ValidationResult validate(String url) {
        if (url == null || url.isBlank()) {
            return ValidationResult.failure("URL is empty");
        }

        URI uri;
        try {
            uri = URI.create(url.trim());
        } catch (IllegalArgumentException e) {
            return ValidationResult.failure("Invalid URL format: " + e.getMessage());
        }

        // Check protocol
        String scheme = uri.getScheme();
        if (scheme == null) {
            return ValidationResult.failure("Missing protocol (http/https)");
        }

        scheme = scheme.toLowerCase();
        if (!scheme.equals("http") && !scheme.equals("https")) {
            return ValidationResult.failure("Blocked protocol: " + scheme + ". Only http/https allowed");
        }

        // Check host
        String host = uri.getHost();
        if (host == null || host.isBlank()) {
            return ValidationResult.failure("Missing hostname");
        }

        host = host.toLowerCase();

        // Block localhost variants
        if (host.equals("localhost") || host.equals("127.0.0.1") || host.equals("::1") ||
            host.equals("[::1]") || host.equals("0.0.0.0")) {
            return ValidationResult.failure("Blocked: localhost access not allowed");
        }

        // Block internal hostnames
        if (BLOCKED_HOSTNAMES.contains(host)) {
            return ValidationResult.failure("Blocked: internal service hostname");
        }

        // Block internal domain patterns
        if (INTERNAL_PATTERN.matcher(host).matches()) {
            return ValidationResult.failure("Blocked: internal domain pattern");
        }

        // Check if it's an IP address
        if (isIpAddress(host)) {
            return validateIpAddress(host);
        }

        // Resolve hostname and check resulting IP
        try {
            InetAddress[] addresses = InetAddress.getAllByName(host);
            for (InetAddress addr : addresses) {
                ValidationResult ipResult = validateIpAddress(addr.getHostAddress());
                if (!ipResult.isValid()) {
                    return ValidationResult.failure("Hostname resolves to blocked IP: " + addr.getHostAddress());
                }
            }
        } catch (UnknownHostException e) {
            // Can't resolve - might be valid external host, allow it
            log.debug("Could not resolve hostname: {}", host);
        }

        // Check port (block common internal ports)
        int port = uri.getPort();
        if (port != -1 && isInternalPort(port)) {
            log.warn("Allowing URL with internal port {}: {}", port, url);
            // Warning only - don't block, as some legitimate sites use non-standard ports
        }

        return ValidationResult.success();
    }

    /**
     * Validate an IP address.
     */
    private ValidationResult validateIpAddress(String ip) {
        try {
            InetAddress addr = InetAddress.getByName(ip);
            byte[] bytes = addr.getAddress();

            // IPv4
            if (bytes.length == 4) {
                int first = bytes[0] & 0xFF;
                int second = bytes[1] & 0xFF;

                // Loopback: 127.x.x.x
                if (first == 127) {
                    return ValidationResult.failure("Blocked: loopback address");
                }

                // Private: 10.x.x.x
                if (first == 10) {
                    return ValidationResult.failure("Blocked: private IP (10.x.x.x)");
                }

                // Private: 172.16.x.x - 172.31.x.x
                if (first == 172 && second >= 16 && second <= 31) {
                    return ValidationResult.failure("Blocked: private IP (172.16-31.x.x)");
                }

                // Private: 192.168.x.x
                if (first == 192 && second == 168) {
                    return ValidationResult.failure("Blocked: private IP (192.168.x.x)");
                }

                // Link-local: 169.254.x.x (AWS/cloud metadata!)
                if (first == 169 && second == 254) {
                    return ValidationResult.failure("Blocked: link-local address (cloud metadata endpoint)");
                }

                // Multicast: 224.x.x.x - 239.x.x.x
                if (first >= 224 && first <= 239) {
                    return ValidationResult.failure("Blocked: multicast address");
                }

                // Broadcast: 255.255.255.255
                if (first == 255 && second == 255) {
                    return ValidationResult.failure("Blocked: broadcast address");
                }

                // 0.0.0.0
                if (first == 0) {
                    return ValidationResult.failure("Blocked: unspecified address");
                }
            }

            // IPv6 checks
            if (bytes.length == 16) {
                if (addr.isLoopbackAddress()) {
                    return ValidationResult.failure("Blocked: IPv6 loopback");
                }
                if (addr.isLinkLocalAddress()) {
                    return ValidationResult.failure("Blocked: IPv6 link-local");
                }
                if (addr.isSiteLocalAddress()) {
                    return ValidationResult.failure("Blocked: IPv6 site-local");
                }
            }

            return ValidationResult.success();

        } catch (UnknownHostException e) {
            return ValidationResult.failure("Invalid IP address: " + ip);
        }
    }

    private boolean isIpAddress(String host) {
        // Simple check for IPv4 or IPv6
        return host.matches("^\\d{1,3}(\\.\\d{1,3}){3}$") || // IPv4
               host.contains(":"); // IPv6
    }

    private boolean isInternalPort(int port) {
        // Common internal service ports
        return port == 5432 ||   // PostgreSQL
               port == 3306 ||   // MySQL
               port == 6379 ||   // Redis
               port == 5672 ||   // RabbitMQ
               port == 27017 ||  // MongoDB
               port == 9200 ||   // Elasticsearch
               port == 9092 ||   // Kafka
               port == 2181;     // Zookeeper
    }

    /**
     * Result of URL validation.
     */
    public static class ValidationResult {
        private final boolean valid;
        private final String reason;

        private ValidationResult(boolean valid, String reason) {
            this.valid = valid;
            this.reason = reason;
        }

        public static ValidationResult success() {
            return new ValidationResult(true, null);
        }

        public static ValidationResult failure(String reason) {
            return new ValidationResult(false, reason);
        }

        public boolean isValid() {
            return valid;
        }

        public String getReason() {
            return reason;
        }
    }
}
