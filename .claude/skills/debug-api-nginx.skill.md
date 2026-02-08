# Debug API Nginx Skill

Debug API endpoints that fail, hang, or behave unexpectedly when proxied through the OpenResty/Nginx gateway.

## What this skill does

This skill helps you:
- Diagnose API endpoints that hang or timeout through the gateway proxy
- Identify misconfigured nginx location blocks (missing HTTP/1.1, wrong Connection header, buffer issues)
- Debug Lua authentication (`resty.openidc`) blocking or interfering with proxy responses
- Add new location blocks with correct proxy settings for new backend services
- Debug WebSocket connection failures through the gateway
- Trace request flow from client through gateway to upstream service

## When to invoke this skill

Invoke this skill when the user asks about:
- "API endpoint hangs through nginx"
- "Request works directly but not through gateway"
- "Proxy timeout on large response"
- "Add nginx route for new service"
- "WebSocket not connecting through gateway"
- "API returns 502/504 through proxy"
- "Gateway not forwarding requests"
- "Debug nginx proxy issue"
- "Response truncated through gateway"
- "Authentication blocking my API"

---

## Gateway Architecture

```
┌──────────┐     ┌──────────────────────────────────┐     ┌──────────────┐
│  Client   │────▶│  OpenResty Gateway (port 80/443) │────▶│  Upstream    │
│ (browser) │     │  ┌─────────────────────────────┐ │     │  Services    │
│           │◀────│  │ Lua Auth (resty.openidc)     │ │◀────│  (Docker)    │
└──────────┘     │  │ → Keycloak validation        │ │     └──────────────┘
                  │  └─────────────────────────────┘ │
                  └──────────────────────────────────┘
```

- **Gateway**: OpenResty (nginx + Lua) running in Docker
- **Auth**: `resty.openidc` authenticates via Keycloak in `access_by_lua_block`
- **Upstreams**: Defined as `map` variables with dynamic DNS resolution (`resolver 127.0.0.11`)
- **Services**: api (8000), functions (9000), workflows (7002), kv (7003), conduit (7004), journal (7005), textlens (7006), parcour (7007)

---

## Instructions for AI

When this skill is invoked:

### 1. Isolate the Problem Layer

Run these diagnostic commands to determine where the issue is:

```bash
# 1. Test direct access to the upstream service (bypasses gateway entirely)
curl -s -o /dev/null -w "%{http_code} %{size_download} %{time_total}s" --max-time 10 'http://localhost:<SERVICE_PORT>/<path>'

# 2. Test internal Docker network (gateway → upstream, no Lua auth)
docker exec gateway curl -s -o /dev/null -w "%{http_code} %{size_download} %{time_total}s" --max-time 10 'http://<service>:<port>/<path>'

# 3. Test through gateway proxy (full path: client → nginx → Lua auth → upstream)
curl -s -o /dev/null -w "%{http_code} %{size_download} %{time_total}s" --max-time 10 'http://localhost/<path>'

# 4. Check gateway error logs
docker logs stack-gateway-1 --tail 50 2>&1 | grep -i error

# 5. Check nginx error log inside container
docker exec stack-gateway-1 cat /usr/local/openresty/nginx/logs/error.log | tail -30
```

**Interpretation:**
- Direct works, gateway hangs → nginx proxy config issue
- Direct works, internal Docker works, gateway hangs → Lua auth or proxy config issue
- Nothing works → upstream service issue (not a gateway problem)

### 2. Common Root Causes and Fixes

#### Issue: Proxy Hangs on Large Responses (>10-15KB)

**Root cause**: Missing `proxy_http_version 1.1`. Without it, nginx defaults to HTTP/1.0 for upstream connections. HTTP/1.0 does not support chunked transfer encoding. Quarkus/Java services send chunked responses for larger payloads, so the proxy hangs waiting for a Content-Length that never comes.

**Diagnosis**: Test with increasing `limit` query params:
```bash
# Small response works
curl -s -o /dev/null -w "%{http_code} %{size_download}" --max-time 5 'http://localhost/api/v1/<endpoint>?limit=10'
# Large response hangs
curl -s -o /dev/null -w "%{http_code} %{size_download}" --max-time 5 'http://localhost/api/v1/<endpoint>?limit=50'
```

**Fix**: Add `proxy_http_version 1.1` and set `Connection ""`:
```nginx
location /api/v1/<endpoint> {
    # ... auth block ...
    set $target $upstream_<service>_api;
    proxy_pass $target;
    proxy_http_version 1.1;           # REQUIRED for chunked responses
    proxy_set_header Connection "";    # Use "" not "keep-alive"
    # ... other headers ...
}
```

#### Issue: WebSocket Fails to Connect

**Fix**: WebSocket locations need specific headers and long timeouts:
```nginx
location /socket.io/<namespace> {
    access_by_lua_block {
        require("main").authenticateWithKeycloakPass(nil)
    }
    set $target $upstream_<service>_api;
    proxy_pass $target;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";    # "upgrade" not "" for WebSocket
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header X-USER $http_x_user;
    proxy_read_timeout 86400s;
    proxy_send_timeout 86400s;
}
```

#### Issue: 502 Bad Gateway

**Common causes:**
1. Upstream service not running: `docker ps | grep <service>`
2. DNS resolution failure: Check `resolver 127.0.0.11` is set in upstreams config
3. Wrong upstream variable: Verify `$upstream_<service>_api` is defined in `fully-env-upstreams.conf`

#### Issue: Auth Blocking Requests

**Diagnosis**: Temporarily remove the `access_by_lua_block` to confirm auth is the problem:
```nginx
location /api/v1/<endpoint> {
    # access_by_lua_block {
    #     require("main").authenticateWithKeycloakPass(nil)
    # }
    set $target $upstream_<service>_api;
    proxy_pass $target;
    # ...
}
```

**Auth modes available in `main.lua`:**
- `authenticateWithKeycloakPass(nil)` - Standard Keycloak token validation (most common)
- `authenticateWithOptionalAnonymous(resourceType, resourceId, appId)` - Checks anonymous access first, falls back to Keycloak
- No auth block - Public endpoint (no authentication required)

### 3. Adding a New Location Block

When adding a new backend service route, use this template:

#### Standard REST API Location
```nginx
location /api/v1/<service_path> {
    access_by_lua_block {
        require("main").authenticateWithKeycloakPass(nil)
    }
    set $target $upstream_<service>_api;
    proxy_pass $target;
    proxy_http_version 1.1;
    proxy_redirect off;
    proxy_cache_bypass $http_upgrade;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "";
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header X-Forwarded-Host $server_name;
    proxy_set_header X-USER $http_x_user;
}
```

#### Location with X-USER from Lua Auth
When the service needs the authenticated user ID set by the Lua auth module:
```nginx
location /api/v1/<service_path> {
    set $x_user "";
    access_by_lua_block {
        require("main").authenticateWithKeycloakPass(nil)
        ngx.var.x_user = ngx.req.get_headers()["X-USER"] or ""
    }
    set $target $upstream_<service>_api;
    proxy_pass $target;
    proxy_http_version 1.1;
    proxy_redirect off;
    proxy_cache_bypass $http_upgrade;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "";
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header X-Forwarded-Host $server_name;
    proxy_set_header X-USER $x_user;
}
```

**Note on X-USER**: `$http_x_user` reads from the original client request headers. If the Lua auth module sets X-USER during `access_by_lua_block`, you must capture it with `ngx.var.x_user = ngx.req.get_headers()["X-USER"]` and use `$x_user` instead.

#### Location with Large File Uploads
```nginx
location /api/v1/<upload_path> {
    # ... auth and proxy settings ...
    client_max_body_size 50M;    # Adjust as needed (default is 1M)
}
```

### 4. Adding a New Upstream

To proxy to a new backend service, add it to `services/gateway/Nginx/config/upstreams/fully-env-upstreams.conf`:

```nginx
map $host $upstream_<newservice>_api {
    default http://<newservice>:<port>;
}
```

Then reference it in the location block as `$upstream_<newservice>_api`.

### 5. Rebuild and Test

After modifying gateway config:

```bash
# Rebuild gateway
docker compose -f docker-compose.dev.yml build gateway

# Restart gateway
docker compose -f docker-compose.dev.yml up -d gateway

# Test the endpoint
curl -s -o /dev/null -w "%{http_code} %{size_download} %{time_total}s" --max-time 10 'http://localhost/<path>'
```

---

## Key Configuration Files

### Gateway
- **Nginx main config**: `services/gateway/Nginx/nginx-fully.conf`
- **HTTP settings (buffers, timeouts, gzip)**: `services/gateway/Nginx/config/http.conf`
- **Upstream definitions**: `services/gateway/Nginx/config/upstreams/fully-env-upstreams.conf`
- **Backend locations**: `services/gateway/Nginx/locations/backend.conf`
- **Frontend locations**: `services/gateway/Nginx/locations/main.conf`
- **Application locations**: `services/gateway/Nginx/locations/applications.conf`
- **Lua auth module**: `services/gateway/Nginx/lua-lib/main.lua`
- **Events config**: `services/gateway/Nginx/config/events.conf`

### Global Proxy Settings (http.conf)
```nginx
proxy_buffer_size 128k;
proxy_buffers 4 256k;
proxy_busy_buffers_size 256k;
keepalive_timeout 65;
keepalive_requests 100;
proxy_read_timeout 300;
proxy_connect_timeout 300;
```

### Upstream Map Variables
| Variable | Target |
|----------|--------|
| `$upstream_services_api` | `http://api:8000` |
| `$upstream_functions_api` | `http://functions:9000` |
| `$upstream_workflows_api` | `http://workflows:7002` |
| `$upstream_kv_api` | `http://kv:7003` |
| `$upstream_conduit_api` | `http://conduit:7004` |
| `$upstream_journal_api` | `http://journal:7005` |
| `$upstream_textlens_api` | `http://textlens-api:7006` |
| `$upstream_parcour_api` | `http://parcour:7007` |
| `$upstream_keycloak` | `http://keycloak:8080` |

---

## Checklist: Correct Location Block Settings

| Setting | REST API | WebSocket | Public (no auth) |
|---------|----------|-----------|-------------------|
| `proxy_http_version 1.1` | Required | Required | Required |
| `proxy_set_header Connection` | `""` | `"upgrade"` | `""` |
| `proxy_set_header Upgrade` | `$http_upgrade` | `$http_upgrade` | `$http_upgrade` |
| `proxy_read_timeout` | default (300s) | `86400s` | default |
| `proxy_send_timeout` | default (300s) | `86400s` | default |
| `access_by_lua_block` | Yes | Yes | No |
| `proxy_redirect off` | Yes | No | Yes |
| `proxy_cache_bypass` | `$http_upgrade` | No | `$http_upgrade` |

---

## Known Pitfalls

1. **HTTP/1.0 vs HTTP/1.1**: Always use `proxy_http_version 1.1` for Quarkus/Java upstreams. HTTP/1.0 cannot handle chunked transfer encoding and causes hangs on responses >10-15KB.
2. **Connection header**: Use `""` for REST APIs (enables keepalive), `"upgrade"` for WebSocket, never `"keep-alive"` (not standard for proxies).
3. **X-USER header**: `$http_x_user` reads from the original client request, not from headers set during Lua auth. Use the `set $x_user` + `ngx.var.x_user` pattern when the auth module sets X-USER.
4. **Location ordering**: nginx uses longest prefix match for prefix locations, but regex locations (`~`) take priority if matched. Place specific regex locations before generic prefix locations.
5. **Dynamic upstream resolution**: All upstreams use `map` variables with `resolver 127.0.0.11` (Docker DNS). If a service is down, DNS resolution may fail silently.
6. **Lua auth is synchronous**: The `access_by_lua_block` makes blocking HTTP calls to Keycloak. If Keycloak is slow, all requests are slow.
7. **proxy_pass with variable**: When using `proxy_pass $target` (variable), nginx does NOT append the URI path. The full original request URI is forwarded, which is the desired behavior for path preservation.
