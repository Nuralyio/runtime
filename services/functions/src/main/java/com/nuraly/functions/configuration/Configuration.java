package com.nuraly.functions.configuration;

import jakarta.inject.Singleton;
import org.eclipse.microprofile.config.inject.ConfigProperty;

import java.util.List;
import java.util.Optional;

@Singleton
public class Configuration {

    // Function templates
    @ConfigProperty(name = "nuraly.functions.template.base.path")
    public String FunctionsBasePath;

    // WASM Runtime
    @ConfigProperty(name = "nuraly.wasm.modules-dir", defaultValue = "/var/nuraly/wasm/modules")
    public String WasmModulesDir;

    @ConfigProperty(name = "nuraly.wasm.temp-dir", defaultValue = "/var/nuraly/wasm/temp")
    public String WasmTempDir;

    @ConfigProperty(name = "nuraly.wasm.pool.initial-size", defaultValue = "5")
    public int WasmPoolInitialSize;

    @ConfigProperty(name = "nuraly.wasm.pool.max-size", defaultValue = "100")
    public int WasmPoolMaxSize;

    @ConfigProperty(name = "nuraly.wasm.execution.timeout-ms", defaultValue = "30000")
    public long WasmExecutionTimeoutMs;

    @ConfigProperty(name = "nuraly.wasm.execution.max-memory-mb", defaultValue = "64")
    public int WasmMaxMemoryMb;

    // Network security (configurable)
    @ConfigProperty(name = "nuraly.wasm.network.enabled", defaultValue = "true")
    public boolean NetworkEnabled;

    @ConfigProperty(name = "nuraly.wasm.network.block-localhost", defaultValue = "true")
    public boolean BlockLocalhost;

    @ConfigProperty(name = "nuraly.wasm.network.block-private-ips", defaultValue = "true")
    public boolean BlockPrivateIps;

    @ConfigProperty(name = "nuraly.wasm.network.blocked-hosts")
    public Optional<List<String>> BlockedHosts;

    @ConfigProperty(name = "nuraly.wasm.network.allowed-hosts")
    public Optional<List<String>> AllowedHosts;

    @ConfigProperty(name = "nuraly.wasm.network.timeout-seconds", defaultValue = "30")
    public int NetworkTimeoutSeconds;

    // URL Import settings
    @ConfigProperty(name = "nuraly.url-import.enabled", defaultValue = "true")
    public boolean UrlImportEnabled;

    @ConfigProperty(name = "nuraly.url-import.timeout-seconds", defaultValue = "30")
    public int UrlImportTimeoutSeconds;

    @ConfigProperty(name = "nuraly.url-import.max-size-bytes", defaultValue = "5242880")  // 5MB
    public int UrlImportMaxSizeBytes;

    @ConfigProperty(name = "nuraly.url-import.max-imports", defaultValue = "20")
    public int UrlImportMaxImports;

    @ConfigProperty(name = "nuraly.url-import.allowed-domains")
    public Optional<List<String>> UrlImportAllowedDomains;

    @ConfigProperty(name = "nuraly.url-import.blocked-patterns")
    public Optional<List<String>> UrlImportBlockedPatterns;

    @ConfigProperty(name = "nuraly.url-import.cache-ttl-seconds", defaultValue = "3600")
    public int UrlImportCacheTtlSeconds;
}
