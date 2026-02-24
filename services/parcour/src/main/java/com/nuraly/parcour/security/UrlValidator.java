package com.nuraly.parcour.security;

import com.nuraly.parcour.configuration.CrawlerConfiguration;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import org.jboss.logging.Logger;

import java.net.InetAddress;
import java.net.URI;
import java.net.URISyntaxException;
import java.net.UnknownHostException;
import java.util.regex.Pattern;

@ApplicationScoped
public class UrlValidator {

    private static final Logger LOG = Logger.getLogger(UrlValidator.class);

    // Patterns for private IP ranges
    private static final Pattern PRIVATE_IP_PATTERN = Pattern.compile(
            "^(10\\.|172\\.(1[6-9]|2[0-9]|3[01])\\.|192\\.168\\.|127\\.|0\\.|169\\.254\\.|fc00:|fe80:|::1|localhost)"
    );

    @Inject
    CrawlerConfiguration config;

    public UrlValidationResult validate(String url) {
        if (url == null || url.isBlank()) {
            return UrlValidationResult.invalid("URL is empty");
        }

        URI uri;
        try {
            uri = new URI(url);
        } catch (URISyntaxException e) {
            return UrlValidationResult.invalid("Invalid URL format: " + e.getMessage());
        }

        // Check scheme
        String scheme = uri.getScheme();
        if (scheme == null || !config.allowedSchemes.contains(scheme.toLowerCase())) {
            return UrlValidationResult.invalid("Invalid scheme: " + scheme + ". Allowed: " + config.allowedSchemes);
        }

        // Check host
        String host = uri.getHost();
        if (host == null || host.isBlank()) {
            return UrlValidationResult.invalid("Missing host");
        }

        // Block localhost
        if (config.blockLocalhost && isLocalhost(host)) {
            return UrlValidationResult.invalid("Localhost URLs are not allowed");
        }

        // Block private IPs
        if (config.blockPrivateIps && isPrivateIp(host)) {
            return UrlValidationResult.invalid("Private IP addresses are not allowed");
        }

        // DNS rebinding protection - resolve hostname and check IP
        if (config.blockPrivateIps) {
            try {
                InetAddress[] addresses = InetAddress.getAllByName(host);
                for (InetAddress addr : addresses) {
                    String ip = addr.getHostAddress();
                    if (isPrivateIp(ip) || isLocalhost(ip)) {
                        return UrlValidationResult.invalid("Host resolves to private/local IP: " + ip);
                    }
                }
            } catch (UnknownHostException e) {
                return UrlValidationResult.invalid("Cannot resolve host: " + host);
            }
        }

        return UrlValidationResult.ok();
    }

    private boolean isLocalhost(String host) {
        return host.equalsIgnoreCase("localhost") ||
               host.equals("127.0.0.1") ||
               host.equals("::1") ||
               host.equals("0.0.0.0");
    }

    private boolean isPrivateIp(String host) {
        return PRIVATE_IP_PATTERN.matcher(host.toLowerCase()).find();
    }
}
