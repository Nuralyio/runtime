local http = require "resty.http"
local cjson = require "cjson"

local host = os.getenv("KC_HOSTNAME")
local realm = os.getenv("KEYCLOAK_REALM")
local client_id = os.getenv("KEYCLOAK_CLIENT_ID")
local client_secret = os.getenv("KEYCLOAK_CLIENT_SECRET")
local scheme = os.getenv("KEYCLOAK_SCHEME")

-- Get Keycloak Admin Token
local token_url = scheme .. "://"..host .. "/auth/realms/" .. realm .. "/protocol/openid-connect/token"
local token_data = {
    grant_type = "client_credentials",
    client_id = client_id,
    client_secret = client_secret
}

local httpc = http.new()
local res, err = httpc:request_uri(token_url, {
    method = "POST",
    body = ngx.encode_args(token_data),
    headers = {
        ["Content-Type"] = "application/x-www-form-urlencoded"
    }
})

if not res or res.status ~= 200 then
    ngx.log(ngx.ERR, "Failed to obtain Keycloak admin token: ", err or res.reason)
    ngx.say(ngx.HTTP_INTERNAL_SERVER_ERROR)
end

local access_token = cjson.decode(res.body)["access_token"]

-- Retrieve user ID from NGINX variable
local user_id_to_retrieve = ngx.var.user_id_to_retrieve or ""
if user_id_to_retrieve == "" then
    ngx.log(ngx.ERR, "No user ID provided.")
    ngx.say(ngx.HTTP_BAD_REQUEST)
end

-- Perform asynchronous HTTP request for the single user ID
local user_info_url = scheme .. "://".. host .. "/auth/admin/realms/master/ui-ext/brute-force-user?briefRepresentation=true&first=0&max=11&q="

local res, err = httpc:request_uri(user_info_url, {
    method = "GET",
    headers = {
        ["Authorization"] = "Bearer " .. access_token
    }
})

if not res or res.status ~= 200 then
    ngx.log(ngx.ERR, "Failed to retrieve user info for user ID ", user_id_to_retrieve, ": ", err or res.reason)
    ngx.say(ngx.HTTP_INTERNAL_SERVER_ERROR)
end

-- Convert the user info to JSON
local response_json = res.body

-- Send the JSON response to NGINX
ngx.header["Content-Type"] = "application/json"
-- ngx.print(response_json)
