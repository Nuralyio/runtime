
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
  if jwt_obj and jwt_obj.payload.resource_access.account.roles then
      roles = map(roleOf, jwt_obj.payload.resource_access.account.roles)
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
local redirect_uri = ngx.var.request_uri
local opts = {
    ssl_verify = "no",
    redirect_uri = "/cb",
    discovery = scheme .. "://nuraly.io/auth/realms/".. realm .."/.well-known/openid-configuration",
    client_id = client_id,
    client_secret = client_secret,
    scope = "openid email profile roles",
    session_contents = {id_token=true, access_token=true, refresh_token=true, enc_id_token=true, realm_access=true},


}

local function authenticateWithKeycloakPass(customRedirectUri)
    
    ngx.log(ngx.INFO, "request_uri: " .. ngx.var.request_uri)
    local redirectUriToUse = ""
    if customRedirectUri then 
        redirectUriToUse = scheme .. "://nuraly.io/cb"
    else
        redirectUriToUse = opts.redirect_uri
    end
    -- Check if a custom redirect_uri is provided, otherwise use the default one
    -- Update the opts table with the chosen redirect_uri
    local optsWithCustomRedirect = {
        ssl_verify = "no",
        redirect_uri = redirectUriToUse,
        discovery = scheme .. "://nuraly.io/auth/realms/" .. realm .. "/.well-known/openid-configuration",
        client_id = client_id,
        client_secret = client_secret,
        scope = "openid email profile roles",
        session_contents = {id_token=true, access_token=true, refresh_token=true, enc_id_token=true, realm_access=true},
    }

    local res, err = require("resty.openidc").authenticate(optsWithCustomRedirect, nil, "pass")
    
    if err then
        if string.find(err, "no session state found") then
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
    ngx.log(ngx.INFO, scheme .. "://nuraly.io/auth/realms/" .. realm .. "/.well-known/openid-configuration")
    

    local res, err = require("resty.openidc").authenticate(opts)
    
    if err then
        if string.find(err, "no session state found") then
            ngx.redirect(redirect_uri)
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

return {
    authenticateWithKeycloak = authenticateWithKeycloak,
    authenticateWithKeycloakPass = authenticateWithKeycloakPass
}

