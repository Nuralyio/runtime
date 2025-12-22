
local cjson = require "cjson"
local jwt = require "resty.jwt"

local function toJson(data)
    return cjson.encode(data)
end


local function toToken(res)

  local function roleOf(role)
      return "ROLE_" .. role:upper()
  end

  local function map(func, array)
        local new_array = {}
        for i,v in ipairs(array) do
          new_array[i] = v
        end
        return new_array
  end
  
  local jwt_obj = jwt:load_jwt(res.access_token)
    
  ngx.log(ngx.STDERR, toJson(jwt_obj))
  

  local roles = {}
  -- Safely extract roles from the JWT token
  if jwt_obj and jwt_obj.payload and jwt_obj.payload.resource_access then
      -- Try to get roles from the client-specific resource_access
      if jwt_obj.payload.resource_access["nuraly-web"] and jwt_obj.payload.resource_access["nuraly-web"].roles then
          roles = map(roleOf, jwt_obj.payload.resource_access["nuraly-web"].roles)
      -- Fallback to realm_access roles if available
      elseif jwt_obj.payload.realm_access and jwt_obj.payload.realm_access.roles then
          roles = map(roleOf, jwt_obj.payload.realm_access.roles)
      end
  end
 
  local token = {
        uuid = res.id_token.sub,
        username = res.id_token.preferred_username,
        email = res.id_token.email,
        ---first_name = res.id_token.given_name,
        last_name = res.id_token.family_name,
        anonymous = false,
        roles = roles
    }

  return toJson(token)
end

local host = os.getenv("KC_HOSTNAME")
local realm = os.getenv("KEYCLOAK_REALM")
local client_id = os.getenv("KEYCLOAK_CLIENT_ID")
local client_secret = os.getenv("KEYCLOAK_CLIENT_SECRET")
local scheme = os.getenv("KEYCLOAK_SCHEME")
local keycloak_fullurl = os.getenv("KEYCLOAK_FULLURL")

local opts = {
    ssl_verify = "no",
    redirect_uri = "/cb",
    discovery = keycloak_fullurl .."/auth/realms/".. realm .."/.well-known/openid-configuration",
    client_id = client_id,
    client_secret = client_secret,
    scope = "openid email profile roles",
    session_contents = {id_token=true, access_token=true, refresh_token=true, enc_id_token=true, realm_access=true},
}


local function authenticateWithKeycloakPass(customRedirectUri)
    ngx.log(ngx.INFO, "host: " .. tostring(host) )
    ngx.log(ngx.INFO, "scheme: " .. tostring(scheme) )
    ngx.log(ngx.INFO, "request_uri: " .. ngx.var.request_uri)
    local redirectUriToUse = ""
    if customRedirectUri then 
        redirectUriToUse = scheme .. "://"..host.."/cb"
    else
        redirectUriToUse = opts.redirect_uri
    end
    -- Check if a custom redirect_uri is provided, otherwise use the default one
    -- Update the opts table with the chosen redirect_uri
    local optsWithCustomRedirect = {
        ssl_verify = "no",
        redirect_uri = redirectUriToUse,
        discovery = scheme .. "://"..host.."/auth/realms/" .. realm .. "/.well-known/openid-configuration",
        client_id = client_id,
        client_secret = client_secret,
        scope = "openid email profile roles",
        session_contents = {id_token=true, access_token=true, refresh_token=true, enc_id_token=true, realm_access=true},
    }

    local res, err = require("resty.openidc").authenticate(optsWithCustomRedirect, nil, "pass")
    
    if err then
        if string.find(err, "no  state found") then
            ngx.redirect(redirectUriToUse)
        elseif string.find(err, "state from argument does not") then
            ngx.redirect("/")
        else
            ngx.log(ngx.ERR, err)
            ngx.exit(ngx.HTTP_INTERNAL_SERVER_ERROR)
        end
    else
        if res then
            ngx.req.set_header("X-USER", toToken(res))
        end
    end
end



local function authenticateWithKeycloak()
    ngx.log(ngx.INFO, scheme .. "://"..host.."/auth/realms/" .. realm .. "/.well-known/openid-configuration")
    

    local res, err = require("resty.openidc").authenticate(opts)
    
    if err then
        if string.find(err, "no session state found") then
            ngx.redirect(ngx.var.request_uri)
        elseif string.find(err, "state from argument does not") then
            ngx.redirect("/")
        else
            ngx.log(ngx.ERR, err)
            ngx.exit(ngx.HTTP_INTERNAL_SERVER_ERROR)
        end
    else
        ngx.req.set_header("X-USER", toToken(res))
    end
end

local function logout()
    local optsWithCustomRedirect = {
        ssl_verify = "no",
        redirect_uri = "/cb",
        discovery = scheme .. "://"..host.."/auth/realms/" .. realm .. "/.well-known/openid-configuration",
        client_id = client_id,
        logout_path = "/logout",
        revoke_tokens_on_logout = true,
        logout_post_redirect_uri = "/",
        client_secret = client_secret,
        scope = "openid email profile roles",
        session_contents = {id_token=true, access_token=true, refresh_token=true, enc_id_token=true, realm_access=true},
    }
    local res, err = require("resty.openidc").authenticate(optsWithCustomRedirect)
end

-- Anonymous user object (reusable)
local function createAnonymousUser()
    return cjson.encode({
        uuid = "anonymous",
        username = "anonymous",
        email = nil,
        last_name = nil,
        anonymous = true,
        roles = {}
    })
end

-- Check anonymous access for a resource by calling the API
-- Returns: { allowed: bool, restricted: bool, permission: string|nil } or nil on error
local function checkAnonymousAccess(resourceType, resourceId)
    local http = require "resty.http"
    local httpc = http.new()

    local api_url = "http://api:8000/api/resources/" .. resourceType .. "/" .. resourceId .. "/check-anonymous"

    local res, err = httpc:request_uri(api_url, {
        method = "GET",
        headers = { ["Content-Type"] = "application/json" }
    })

    if not res then
        ngx.log(ngx.ERR, "Failed to check anonymous access: " .. (err or "unknown error"))
        return nil
    end

    if res.status == 200 then
        return cjson.decode(res.body)
    end

    return nil
end

-- URL encode a string for safe use in URLs
local function url_encode(str)
    if str then
        str = string.gsub(str, "([^%w%-%.%_%~])", function(c)
            return string.format("%%%02X", string.byte(c))
        end)
    end
    return str
end

-- Check anonymous access for a page by URL slug within an application
-- This resolves the page by URL slug (e.g., "blog1") or UUID first
-- Returns: { allowed: bool, restricted: bool, permission: string|nil, pageUuid: string|nil } or nil on error
local function checkAnonymousAccessByPageUrl(applicationId, pageUrl)
    local http = require "resty.http"
    local httpc = http.new()

    -- URL encode parameters to prevent injection
    local safe_app_id = url_encode(applicationId)
    local safe_page_url = url_encode(pageUrl)

    local api_url = "http://api:8000/api/resources/page/by-url/" .. safe_app_id .. "/" .. safe_page_url .. "/check-anonymous"

    local res, err = httpc:request_uri(api_url, {
        method = "GET",
        headers = { ["Content-Type"] = "application/json" }
    })

    if not res then
        ngx.log(ngx.ERR, "Failed to check anonymous access by page URL: " .. (err or "unknown error"))
        return nil
    end

    if res.status == 200 then
        return cjson.decode(res.body)
    end

    return nil
end

-- Authenticate with optional anonymous access using "pass" mode
-- First tries Keycloak auth in pass mode, if no session then checks anonymous access
-- Page-level restrictions OVERRIDE application-level anonymous access
local function authenticateWithOptionalAnonymous(resourceType, resourceId, applicationId)
    local optsPass = {
        ssl_verify = "no",
        redirect_uri = "/cb",
        discovery = scheme .. "://"..host.."/auth/realms/" .. realm .. "/.well-known/openid-configuration",
        client_id = client_id,
        client_secret = client_secret,
        scope = "openid email profile roles",
        session_contents = {id_token=true, access_token=true, refresh_token=true, enc_id_token=true, realm_access=true},
    }

    -- Try authentication in "pass" mode (doesn't redirect, just checks if user is logged in)
    local res, err = require("resty.openidc").authenticate(optsPass, nil, "pass")

    if res then
        -- User is authenticated, set token header
        ngx.req.set_header("X-USER", toToken(res))
        return
    end

    -- No session - check if anonymous access is allowed
    local accessCheck = nil

    -- For pages, use the URL-based endpoint to resolve page by URL slug or UUID
    if resourceType == "page" and applicationId then
        accessCheck = checkAnonymousAccessByPageUrl(applicationId, resourceId)
    else
        accessCheck = checkAnonymousAccess(resourceType, resourceId)
    end

    if accessCheck then
        if accessCheck.allowed then
            -- Resource explicitly allows anonymous access
            ngx.req.set_header("X-USER", createAnonymousUser())
            return
        elseif accessCheck.restricted then
            -- Resource is restricted - do not allow anonymous access or inheritance
            authenticateWithKeycloak()
            return
        end
    end

    -- Resource has no explicit setting - check application-level inheritance
    if applicationId and resourceType ~= "application" then
        local appCheck = checkAnonymousAccess("application", applicationId)
        if appCheck and appCheck.allowed then
            ngx.req.set_header("X-USER", createAnonymousUser())
            return
        end
    end

    -- No anonymous access allowed, redirect to Keycloak login
    authenticateWithKeycloak()
end

return {
    authenticateWithKeycloak = authenticateWithKeycloak,
    authenticateWithKeycloakPass = authenticateWithKeycloakPass,
    authenticateWithOptionalAnonymous = authenticateWithOptionalAnonymous,
    logout = logout
}

