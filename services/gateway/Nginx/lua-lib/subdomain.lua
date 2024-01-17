

local function handleSubdomain()
    ngx.log(ngx.INFO, "handleSubdomain")
    local subdomain = ngx.var.subdomain

    if subdomain == nil or subdomain == "" then
        ngx.var.target="http://front/";
    elseif subdomain == "learn"  then
    ngx.log(ngx.INFO,"subdomain " .. subdomain)
        ngx.var.target="http://learn";
    else
        -- Subdomain detected, construct the target URL
        ngx.var.target="http://nginx/app/view/" .. subdomain .. ngx.var.request_uri;
        local http = require("resty.http")
        local httpc = http.new()
        
        -- Combine the URI and query parameters
        local uri_with_query = ngx.var.http_referer

        local request_uri = ngx.var.request_uri
        local isFileRequest = string.match(request_uri, "%.([a-zA-Z0-9]+)$")
        if not isFileRequest then
            -- Define the JSON payload

            local json_payload = '{"url":"' .. ngx.var.escaped_query .. ngx.var.request_uri .. '"}'
                ngx.log(ngx.ERR, json_payload)
            
            -- Make a POST request to /api/applications/check-auth
            local res, err = httpc:request_uri("http://nginx/api/applications/check-auth", {
                method = "POST",
                body = json_payload,
                headers = {
                    ["Content-Type"] = "application/json"
                }
            })

            if not res then
                ngx.log(ngx.ERR, "Failed to make request to check-auth API: ", err)
                ngx.exit(ngx.HTTP_INTERNAL_SERVER_ERROR)
                return
            end
                ngx.log(ngx.ERR, "HOSSSTTT ", ngx.var.request_uri)

            if subdomain ~= "learn" then
                -- Check the response and execute the appropriate authentication function
                if res.status == 200 and res.body == "true" then
                    ngx.log(ngx.INFO, "Acces without Auth: ")

                    require("main").authenticateWithKeycloak()
                else
                    ngx.log(ngx.INFO, "Acces with Auth: ")

                    require("main").authenticateWithKeycloakPass(subdomain..".localhost")
                end
            end
        end
    end
end


local function handleSubdomainStaticFiles()
    local subdomain = ngx.var.subdomain

    if subdomain ~= nil and subdomain == "learn" then
        -- Subdomain detected, construct the target URL
        ngx.var.target = "http://" .. subdomain .. ngx.var.request_uri;
    else
        ngx.var.target = "http://front" .. ngx.var.request_uri;
    end
end
                
return {
    handleSubdomain = handleSubdomain
    handleSubdomainStaticFiles = handleSubdomainStaticFiles
}