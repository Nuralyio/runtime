"""
URL Security Validator - Prevents SSRF attacks.

Blocks:
- Private IP ranges (10.x, 172.16-31.x, 192.168.x)
- Localhost (127.0.0.1, localhost, ::1)
- Link-local addresses (169.254.x.x - AWS metadata!)
- Internal service hostnames
- Non-HTTP protocols
"""
import ipaddress
import logging
import re
import socket
from typing import Optional, Tuple
from urllib.parse import urlparse

logger = logging.getLogger(__name__)

# Internal hostnames to block (common Docker/K8s service names)
BLOCKED_HOSTNAMES = {
    'localhost',
    'postgres', 'postgresql', 'db', 'database',
    'redis', 'cache',
    'rabbitmq', 'rabbit', 'mq', 'amqp',
    'minio', 's3', 'storage',
    'elasticsearch', 'elastic', 'es',
    'mongodb', 'mongo',
    'mysql', 'mariadb',
    'kafka', 'zookeeper',
    'consul', 'etcd', 'vault',
    'grafana', 'prometheus', 'jaeger',
    'nginx', 'traefik', 'envoy',
    'api', 'backend', 'frontend', 'app',
    'internal', 'private', 'admin'
}

# Patterns for blocked hostnames
INTERNAL_PATTERN = re.compile(
    r'^(.*\.)?(internal|local|private|corp|intranet|lan)$',
    re.IGNORECASE
)

# Common internal service ports
INTERNAL_PORTS = {5432, 3306, 6379, 5672, 27017, 9200, 9092, 2181}


class ValidationResult:
    """Result of URL validation."""

    def __init__(self, valid: bool, reason: Optional[str] = None):
        self.valid = valid
        self.reason = reason

    @classmethod
    def success(cls) -> 'ValidationResult':
        return cls(True)

    @classmethod
    def failure(cls, reason: str) -> 'ValidationResult':
        return cls(False, reason)


def validate_url(url: str) -> ValidationResult:
    """
    Validate a URL for safe crawling.

    Args:
        url: The URL to validate

    Returns:
        ValidationResult with success/failure and reason
    """
    if not url or not url.strip():
        return ValidationResult.failure("URL is empty")

    try:
        parsed = urlparse(url.strip())
    except Exception as e:
        return ValidationResult.failure(f"Invalid URL format: {e}")

    # Check protocol
    scheme = parsed.scheme.lower() if parsed.scheme else None
    if not scheme:
        return ValidationResult.failure("Missing protocol (http/https)")

    if scheme not in ('http', 'https'):
        return ValidationResult.failure(f"Blocked protocol: {scheme}. Only http/https allowed")

    # Check host
    host = parsed.hostname
    if not host:
        return ValidationResult.failure("Missing hostname")

    host = host.lower()

    # Block localhost variants
    if host in ('localhost', '127.0.0.1', '::1', '[::1]', '0.0.0.0'):
        return ValidationResult.failure("Blocked: localhost access not allowed")

    # Block internal hostnames
    if host in BLOCKED_HOSTNAMES:
        return ValidationResult.failure("Blocked: internal service hostname")

    # Block internal domain patterns
    if INTERNAL_PATTERN.match(host):
        return ValidationResult.failure("Blocked: internal domain pattern")

    # Check if it's an IP address
    if is_ip_address(host):
        result = validate_ip_address(host)
        if not result.valid:
            return result
    else:
        # Resolve hostname and check resulting IP
        try:
            addresses = socket.getaddrinfo(host, None, socket.AF_UNSPEC, socket.SOCK_STREAM)
            for addr_info in addresses:
                ip = addr_info[4][0]
                result = validate_ip_address(ip)
                if not result.valid:
                    return ValidationResult.failure(f"Hostname resolves to blocked IP: {ip}")
        except socket.gaierror:
            # Can't resolve - might be valid external host, allow it
            logger.debug(f"Could not resolve hostname: {host}")

    # Check port (warn but don't block)
    port = parsed.port
    if port and port in INTERNAL_PORTS:
        logger.warning(f"URL uses internal port {port}: {url}")

    return ValidationResult.success()


def validate_ip_address(ip: str) -> ValidationResult:
    """Validate an IP address."""
    try:
        addr = ipaddress.ip_address(ip)

        # Check if private
        if addr.is_private:
            return ValidationResult.failure(f"Blocked: private IP address ({ip})")

        # Check if loopback
        if addr.is_loopback:
            return ValidationResult.failure("Blocked: loopback address")

        # Check if link-local (169.254.x.x for IPv4, fe80:: for IPv6)
        if addr.is_link_local:
            return ValidationResult.failure("Blocked: link-local address (cloud metadata endpoint)")

        # Check if multicast
        if addr.is_multicast:
            return ValidationResult.failure("Blocked: multicast address")

        # Check if reserved
        if addr.is_reserved:
            return ValidationResult.failure("Blocked: reserved address")

        # Check if unspecified (0.0.0.0 or ::)
        if addr.is_unspecified:
            return ValidationResult.failure("Blocked: unspecified address")

        return ValidationResult.success()

    except ValueError:
        return ValidationResult.failure(f"Invalid IP address: {ip}")


def is_ip_address(host: str) -> bool:
    """Check if host is an IP address."""
    try:
        ipaddress.ip_address(host.strip('[]'))
        return True
    except ValueError:
        return False
