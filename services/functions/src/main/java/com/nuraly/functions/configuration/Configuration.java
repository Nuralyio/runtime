package com.nuraly.functions.configuration;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Singleton;
import org.eclipse.microprofile.config.inject.ConfigProperty;

import java.util.Optional;

@Singleton
public class Configuration {
    @ConfigProperty(name = "nuraly.functions.template.base.path")
    public String FunctionsBasePath ;

    @ConfigProperty(name = "nuraly-registry-service.username")
    public Optional<String> RegistryUsername;
    @ConfigProperty(name = "nuraly-registry-service.password")
    public Optional<String> RegistryPassword;
    @ConfigProperty(name = "nuraly-registry-service.url")
    public String RegistryURL;
    @ConfigProperty(name = "nuraly-functions.domain")
    public String FunctionsDomain;

    @ConfigProperty(name = "nuraly-functions.port")
    public String FunctionsPort;

    @ConfigProperty(name = "nuraly-functions.gateway-host", defaultValue = "localhost")
    public String FunctionsGatewayHost;

    @ConfigProperty(name = "nuraly-registry-service.skip-push", defaultValue = "false")
    public boolean SkipRegistryPush;

}
