package com.nuraly.kv.configuration;

import io.smallrye.config.ConfigMapping;
import io.smallrye.config.WithDefault;

import java.util.Optional;

@ConfigMapping(prefix = "kv")
public interface KvConfiguration {

    Encryption encryption();

    Ttl ttl();

    Audit audit();

    interface Encryption {
        @WithDefault("dev-master-key-32-bytes-long!!")
        String masterKey();

        @WithDefault("AES/GCM/NoPadding")
        String algorithm();
    }

    interface Ttl {
        Cleanup cleanup();

        interface Cleanup {
            @WithDefault("true")
            boolean enabled();

            @WithDefault("60s")
            String interval();
        }
    }

    interface Audit {
        @WithDefault("true")
        boolean enabled();

        @WithDefault("90")
        int retentionDays();
    }
}
