package com.nuraly.workflows.engine.executors;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.nuraly.workflows.configuration.Configuration;
import com.nuraly.workflows.engine.ExecutionContext;
import com.nuraly.workflows.engine.NodeExecutionResult;
import com.nuraly.workflows.entity.WorkflowNodeEntity;
import com.nuraly.workflows.entity.enums.NodeType;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import org.apache.hc.client5.http.classic.methods.HttpGet;
import org.apache.hc.client5.http.impl.classic.CloseableHttpClient;
import org.apache.hc.client5.http.impl.classic.HttpClients;
import org.apache.hc.core5.http.io.entity.EntityUtils;
import org.jboss.logging.Logger;

import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.time.Instant;
import java.util.Base64;

/**
 * EMAIL Node Executor - Send emails using multiple cloud providers.
 *
 * <p>Supports multiple email providers:</p>
 * <ul>
 *   <li>sendgrid - SendGrid Email API</li>
 *   <li>mailgun - Mailgun Email API</li>
 *   <li>ses - Amazon Simple Email Service</li>
 *   <li>postmark - Postmark Email API</li>
 *   <li>resend - Resend Email API</li>
 * </ul>
 *
 * <p>API keys are fetched from KV store using pattern: email/{provider}/api_key</p>
 *
 * <p>Configuration example:</p>
 * <pre>
 * {
 *   "provider": "sendgrid",
 *   "to": "recipient@example.com",
 *   "from": "sender@example.com",
 *   "subject": "Hello World",
 *   "body": "This is the email body",
 *   "bodyType": "text",
 *   "cc": "cc@example.com",
 *   "bcc": "bcc@example.com",
 *   "replyTo": "reply@example.com"
 * }
 * </pre>
 */
@ApplicationScoped
public class EmailNodeExecutor implements NodeExecutor {

    private static final Logger LOG = Logger.getLogger(EmailNodeExecutor.class);
    private static final int DEFAULT_TIMEOUT_MS = 30000;

    private final ObjectMapper objectMapper = new ObjectMapper();
    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(10))
            .build();

    @Inject
    Configuration configuration;

    @Override
    public NodeType getType() {
        return NodeType.EMAIL;
    }

    @Override
    public NodeExecutionResult execute(ExecutionContext context, WorkflowNodeEntity node) throws Exception {
        if (node.configuration == null) {
            return NodeExecutionResult.failure("EMAIL node configuration is missing");
        }

        JsonNode config = objectMapper.readTree(node.configuration);

        // Get provider
        String provider = config.has("provider") ? config.get("provider").asText() : "sendgrid";

        // Get email fields with expression resolution
        String to = resolveField(config, "to", context);
        String from = resolveField(config, "from", context);
        String subject = resolveField(config, "subject", context);
        String body = resolveField(config, "body", context);
        String bodyType = config.has("bodyType") ? config.get("bodyType").asText() : "text";
        String cc = resolveField(config, "cc", context);
        String bcc = resolveField(config, "bcc", context);
        String replyTo = resolveField(config, "replyTo", context);

        // Validate required fields
        if (to == null || to.isBlank()) {
            return NodeExecutionResult.failure("Email 'to' address is required");
        }
        if (from == null || from.isBlank()) {
            return NodeExecutionResult.failure("Email 'from' address is required");
        }
        if (subject == null || subject.isBlank()) {
            return NodeExecutionResult.failure("Email 'subject' is required");
        }
        if (body == null || body.isBlank()) {
            return NodeExecutionResult.failure("Email 'body' is required");
        }

        int timeout = config.has("timeout") ? config.get("timeout").asInt() : DEFAULT_TIMEOUT_MS;

        LOG.infof("Sending email via %s: to=%s, subject='%s'", provider, to, subject);

        try {
            EmailRequest emailRequest = new EmailRequest(to, from, subject, body, bodyType, cc, bcc, replyTo);

            EmailResult result = switch (provider.toLowerCase()) {
                case "sendgrid" -> sendViaSendGrid(emailRequest, timeout, context);
                case "mailgun" -> sendViaMailgun(emailRequest, timeout, context);
                case "ses" -> sendViaSes(emailRequest, timeout, context);
                case "postmark" -> sendViaPostmark(emailRequest, timeout, context);
                case "resend" -> sendViaResend(emailRequest, timeout, context);
                default -> throw new IllegalArgumentException("Unknown email provider: " + provider);
            };

            // Build output
            ObjectNode output = objectMapper.createObjectNode();
            output.put("success", true);
            output.put("provider", provider);
            output.put("messageId", result.messageId);
            output.put("to", to);
            output.put("from", from);
            output.put("subject", subject);
            output.put("timestamp", Instant.now().toString());

            // Pass through isolationKey if present
            JsonNode input = context.getInput();
            if (input != null && input.has("isolationKey")) {
                output.put("isolationKey", input.get("isolationKey").asText());
            }

            LOG.infof("Email sent successfully via %s: messageId=%s", provider, result.messageId);
            return NodeExecutionResult.success(output);

        } catch (Exception e) {
            LOG.errorf(e, "Email sending failed: provider=%s, to=%s", provider, to);
            boolean retryable = e.getMessage() != null &&
                    (e.getMessage().contains("timeout") ||
                     e.getMessage().contains("connection") ||
                     e.getMessage().contains("rate limit") ||
                     e.getMessage().contains("429"));
            return NodeExecutionResult.failure("Email sending failed: " + e.getMessage(), retryable);
        }
    }

    /**
     * Send email via SendGrid API.
     * KV keys: email/sendgrid/api_key
     */
    private EmailResult sendViaSendGrid(EmailRequest email, int timeout, ExecutionContext context) throws Exception {
        String apiKey = getApiKey("sendgrid", context);
        if (apiKey == null) {
            throw new IllegalStateException("SendGrid API key not configured. Set email/sendgrid/api_key in KV store.");
        }

        ObjectNode payload = objectMapper.createObjectNode();

        // Personalizations (recipients)
        ObjectNode personalization = objectMapper.createObjectNode();
        personalization.set("to", objectMapper.createArrayNode().add(
                objectMapper.createObjectNode().put("email", email.to)
        ));
        if (email.cc != null && !email.cc.isBlank()) {
            personalization.set("cc", objectMapper.createArrayNode().add(
                    objectMapper.createObjectNode().put("email", email.cc)
            ));
        }
        if (email.bcc != null && !email.bcc.isBlank()) {
            personalization.set("bcc", objectMapper.createArrayNode().add(
                    objectMapper.createObjectNode().put("email", email.bcc)
            ));
        }
        payload.set("personalizations", objectMapper.createArrayNode().add(personalization));

        // From
        payload.set("from", objectMapper.createObjectNode().put("email", email.from));

        // Reply-to
        if (email.replyTo != null && !email.replyTo.isBlank()) {
            payload.set("reply_to", objectMapper.createObjectNode().put("email", email.replyTo));
        }

        // Subject
        payload.put("subject", email.subject);

        // Content
        String contentType = "html".equalsIgnoreCase(email.bodyType) ? "text/html" : "text/plain";
        payload.set("content", objectMapper.createArrayNode().add(
                objectMapper.createObjectNode()
                        .put("type", contentType)
                        .put("value", email.body)
        ));

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create("https://api.sendgrid.com/v3/mail/send"))
                .timeout(Duration.ofMillis(timeout))
                .header("Authorization", "Bearer " + apiKey)
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(payload.toString()))
                .build();

        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

        if (response.statusCode() >= 400) {
            throw new RuntimeException("SendGrid API error: " + response.statusCode() + " - " + response.body());
        }

        // SendGrid returns message ID in header
        String messageId = response.headers().firstValue("X-Message-Id").orElse("sg-" + System.currentTimeMillis());
        return new EmailResult(messageId);
    }

    /**
     * Send email via Mailgun API.
     * KV keys: email/mailgun/api_key, email/mailgun/domain
     */
    private EmailResult sendViaMailgun(EmailRequest email, int timeout, ExecutionContext context) throws Exception {
        String apiKey = getApiKey("mailgun", context);
        String domain = getConfigValue("mailgun", "domain", context);

        if (apiKey == null) {
            throw new IllegalStateException("Mailgun API key not configured. Set email/mailgun/api_key in KV store.");
        }
        if (domain == null) {
            throw new IllegalStateException("Mailgun domain not configured. Set email/mailgun/domain in KV store.");
        }

        // Build form data
        StringBuilder formData = new StringBuilder();
        formData.append("from=").append(URLEncoder.encode(email.from, StandardCharsets.UTF_8));
        formData.append("&to=").append(URLEncoder.encode(email.to, StandardCharsets.UTF_8));
        formData.append("&subject=").append(URLEncoder.encode(email.subject, StandardCharsets.UTF_8));

        if ("html".equalsIgnoreCase(email.bodyType)) {
            formData.append("&html=").append(URLEncoder.encode(email.body, StandardCharsets.UTF_8));
        } else {
            formData.append("&text=").append(URLEncoder.encode(email.body, StandardCharsets.UTF_8));
        }

        if (email.cc != null && !email.cc.isBlank()) {
            formData.append("&cc=").append(URLEncoder.encode(email.cc, StandardCharsets.UTF_8));
        }
        if (email.bcc != null && !email.bcc.isBlank()) {
            formData.append("&bcc=").append(URLEncoder.encode(email.bcc, StandardCharsets.UTF_8));
        }
        if (email.replyTo != null && !email.replyTo.isBlank()) {
            formData.append("&h:Reply-To=").append(URLEncoder.encode(email.replyTo, StandardCharsets.UTF_8));
        }

        String auth = Base64.getEncoder().encodeToString(("api:" + apiKey).getBytes(StandardCharsets.UTF_8));

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create("https://api.mailgun.net/v3/" + domain + "/messages"))
                .timeout(Duration.ofMillis(timeout))
                .header("Authorization", "Basic " + auth)
                .header("Content-Type", "application/x-www-form-urlencoded")
                .POST(HttpRequest.BodyPublishers.ofString(formData.toString()))
                .build();

        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

        if (response.statusCode() >= 400) {
            throw new RuntimeException("Mailgun API error: " + response.statusCode() + " - " + response.body());
        }

        JsonNode responseJson = objectMapper.readTree(response.body());
        String messageId = responseJson.has("id") ? responseJson.get("id").asText() : "mg-" + System.currentTimeMillis();
        return new EmailResult(messageId);
    }

    /**
     * Send email via Amazon SES API v2.
     * KV keys: email/ses/api_key (access key), email/ses/secret_key, email/ses/region
     */
    private EmailResult sendViaSes(EmailRequest email, int timeout, ExecutionContext context) throws Exception {
        String accessKey = getApiKey("ses", context);
        String secretKey = getConfigValue("ses", "secret_key", context);
        String region = getConfigValue("ses", "region", context);

        if (accessKey == null || secretKey == null) {
            throw new IllegalStateException("AWS SES credentials not configured. Set email/ses/api_key and email/ses/secret_key in KV store.");
        }
        if (region == null) {
            region = "us-east-1"; // Default region
        }

        // Build SES v2 API request payload
        ObjectNode payload = objectMapper.createObjectNode();

        // From
        payload.put("FromEmailAddress", email.from);

        // Destination
        ObjectNode destination = objectMapper.createObjectNode();
        destination.set("ToAddresses", objectMapper.createArrayNode().add(email.to));
        if (email.cc != null && !email.cc.isBlank()) {
            destination.set("CcAddresses", objectMapper.createArrayNode().add(email.cc));
        }
        if (email.bcc != null && !email.bcc.isBlank()) {
            destination.set("BccAddresses", objectMapper.createArrayNode().add(email.bcc));
        }
        payload.set("Destination", destination);

        // Reply-to
        if (email.replyTo != null && !email.replyTo.isBlank()) {
            payload.set("ReplyToAddresses", objectMapper.createArrayNode().add(email.replyTo));
        }

        // Content
        ObjectNode content = objectMapper.createObjectNode();
        ObjectNode simple = objectMapper.createObjectNode();
        simple.set("Subject", objectMapper.createObjectNode()
                .put("Data", email.subject)
                .put("Charset", "UTF-8"));

        ObjectNode bodyNode = objectMapper.createObjectNode();
        if ("html".equalsIgnoreCase(email.bodyType)) {
            bodyNode.set("Html", objectMapper.createObjectNode()
                    .put("Data", email.body)
                    .put("Charset", "UTF-8"));
        } else {
            bodyNode.set("Text", objectMapper.createObjectNode()
                    .put("Data", email.body)
                    .put("Charset", "UTF-8"));
        }
        simple.set("Body", bodyNode);
        content.set("Simple", simple);
        payload.set("Content", content);

        // Sign the request with AWS Signature Version 4
        String host = "email." + region + ".amazonaws.com";
        String endpoint = "https://" + host + "/v2/email/outbound-emails";
        String payloadString = payload.toString();

        String[] signedHeaders = AwsSignatureV4.sign(
                "POST",
                URI.create(endpoint),
                payloadString,
                accessKey,
                secretKey,
                region,
                "ses"
        );

        HttpRequest.Builder requestBuilder = HttpRequest.newBuilder()
                .uri(URI.create(endpoint))
                .timeout(Duration.ofMillis(timeout))
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(payloadString));

        // Add signed headers
        for (String header : signedHeaders) {
            String[] parts = header.split(":", 2);
            if (parts.length == 2) {
                requestBuilder.header(parts[0].trim(), parts[1].trim());
            }
        }

        HttpResponse<String> response = httpClient.send(requestBuilder.build(), HttpResponse.BodyHandlers.ofString());

        if (response.statusCode() >= 400) {
            throw new RuntimeException("AWS SES API error: " + response.statusCode() + " - " + response.body());
        }

        JsonNode responseJson = objectMapper.readTree(response.body());
        String messageId = responseJson.has("MessageId") ? responseJson.get("MessageId").asText() : "ses-" + System.currentTimeMillis();
        return new EmailResult(messageId);
    }

    /**
     * Send email via Postmark API.
     * KV keys: email/postmark/api_key (Server API Token)
     */
    private EmailResult sendViaPostmark(EmailRequest email, int timeout, ExecutionContext context) throws Exception {
        String apiKey = getApiKey("postmark", context);
        if (apiKey == null) {
            throw new IllegalStateException("Postmark API key not configured. Set email/postmark/api_key in KV store.");
        }

        ObjectNode payload = objectMapper.createObjectNode();
        payload.put("From", email.from);
        payload.put("To", email.to);
        payload.put("Subject", email.subject);

        if ("html".equalsIgnoreCase(email.bodyType)) {
            payload.put("HtmlBody", email.body);
        } else {
            payload.put("TextBody", email.body);
        }

        if (email.cc != null && !email.cc.isBlank()) {
            payload.put("Cc", email.cc);
        }
        if (email.bcc != null && !email.bcc.isBlank()) {
            payload.put("Bcc", email.bcc);
        }
        if (email.replyTo != null && !email.replyTo.isBlank()) {
            payload.put("ReplyTo", email.replyTo);
        }

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create("https://api.postmarkapp.com/email"))
                .timeout(Duration.ofMillis(timeout))
                .header("Accept", "application/json")
                .header("Content-Type", "application/json")
                .header("X-Postmark-Server-Token", apiKey)
                .POST(HttpRequest.BodyPublishers.ofString(payload.toString()))
                .build();

        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

        if (response.statusCode() >= 400) {
            throw new RuntimeException("Postmark API error: " + response.statusCode() + " - " + response.body());
        }

        JsonNode responseJson = objectMapper.readTree(response.body());
        String messageId = responseJson.has("MessageID") ? responseJson.get("MessageID").asText() : "pm-" + System.currentTimeMillis();
        return new EmailResult(messageId);
    }

    /**
     * Send email via Resend API.
     * KV keys: email/resend/api_key
     */
    private EmailResult sendViaResend(EmailRequest email, int timeout, ExecutionContext context) throws Exception {
        String apiKey = getApiKey("resend", context);
        if (apiKey == null) {
            throw new IllegalStateException("Resend API key not configured. Set email/resend/api_key in KV store.");
        }

        ObjectNode payload = objectMapper.createObjectNode();
        payload.put("from", email.from);
        payload.set("to", objectMapper.createArrayNode().add(email.to));
        payload.put("subject", email.subject);

        if ("html".equalsIgnoreCase(email.bodyType)) {
            payload.put("html", email.body);
        } else {
            payload.put("text", email.body);
        }

        if (email.cc != null && !email.cc.isBlank()) {
            payload.set("cc", objectMapper.createArrayNode().add(email.cc));
        }
        if (email.bcc != null && !email.bcc.isBlank()) {
            payload.set("bcc", objectMapper.createArrayNode().add(email.bcc));
        }
        if (email.replyTo != null && !email.replyTo.isBlank()) {
            payload.put("reply_to", email.replyTo);
        }

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create("https://api.resend.com/emails"))
                .timeout(Duration.ofMillis(timeout))
                .header("Authorization", "Bearer " + apiKey)
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(payload.toString()))
                .build();

        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

        if (response.statusCode() >= 400) {
            throw new RuntimeException("Resend API error: " + response.statusCode() + " - " + response.body());
        }

        JsonNode responseJson = objectMapper.readTree(response.body());
        String messageId = responseJson.has("id") ? responseJson.get("id").asText() : "rs-" + System.currentTimeMillis();
        return new EmailResult(messageId);
    }

    /**
     * Resolve a field value from config, supporting expression syntax.
     */
    private String resolveField(JsonNode config, String fieldName, ExecutionContext context) {
        if (!config.has(fieldName)) {
            return null;
        }
        String value = config.get(fieldName).asText();
        if (value == null || value.isBlank()) {
            return null;
        }
        // Resolve expressions like ${input.email} or ${variables.recipient}
        return context.resolveExpression(value);
    }

    private String getApiKey(String provider, ExecutionContext context) {
        return fetchFromKvStore("email/" + provider + "/api_key", context);
    }

    private String getConfigValue(String provider, String configKey, ExecutionContext context) {
        return fetchFromKvStore("email/" + provider + "/" + configKey, context);
    }

    /**
     * Fetch a value from the KV store.
     */
    private String fetchFromKvStore(String keyPath, ExecutionContext context) {
        try {
            String appId = null;
            if (context.getExecution() != null && context.getExecution().workflow != null) {
                appId = context.getExecution().workflow.applicationId != null ?
                        context.getExecution().workflow.applicationId.toString() : null;
            }

            if (appId == null) {
                return null;
            }

            String kvServiceUrl = configuration.kvServiceUrl + "/api/v1/kv/entries/" +
                    URLEncoder.encode(keyPath, StandardCharsets.UTF_8) +
                    "?applicationId=" + appId;

            try (CloseableHttpClient kvHttpClient = HttpClients.createDefault()) {
                HttpGet request = new HttpGet(kvServiceUrl);
                request.addHeader("Content-Type", "application/json");

                var response = kvHttpClient.execute(request);
                int statusCode = response.getCode();

                if (statusCode >= 200 && statusCode < 300) {
                    String responseBody = EntityUtils.toString(response.getEntity());
                    JsonNode kvEntry = objectMapper.readTree(responseBody);
                    if (kvEntry.has("value")) {
                        return kvEntry.get("value").asText();
                    }
                }
            }

            return null;
        } catch (Exception e) {
            LOG.debugf("Failed to fetch from KV store %s: %s", keyPath, e.getMessage());
            return null;
        }
    }

    /**
     * Email request data holder.
     */
    private record EmailRequest(
            String to,
            String from,
            String subject,
            String body,
            String bodyType,
            String cc,
            String bcc,
            String replyTo
    ) {}

    /**
     * Email send result.
     */
    private record EmailResult(String messageId) {}

    /**
     * AWS Signature Version 4 signing utility for SES.
     */
    private static class AwsSignatureV4 {
        private static final String ALGORITHM = "AWS4-HMAC-SHA256";

        public static String[] sign(String method, URI uri, String payload,
                                    String accessKey, String secretKey,
                                    String region, String service) throws Exception {
            java.time.ZonedDateTime now = java.time.ZonedDateTime.now(java.time.ZoneOffset.UTC);
            String amzDate = now.format(java.time.format.DateTimeFormatter.ofPattern("yyyyMMdd'T'HHmmss'Z'"));
            String dateStamp = now.format(java.time.format.DateTimeFormatter.ofPattern("yyyyMMdd"));

            String host = uri.getHost();
            String canonicalUri = uri.getPath().isEmpty() ? "/" : uri.getPath();

            // Create canonical headers
            String payloadHash = sha256Hex(payload);
            String canonicalHeaders = "content-type:application/json\n" +
                    "host:" + host + "\n" +
                    "x-amz-content-sha256:" + payloadHash + "\n" +
                    "x-amz-date:" + amzDate + "\n";
            String signedHeaders = "content-type;host;x-amz-content-sha256;x-amz-date";

            // Create canonical request
            String canonicalRequest = method + "\n" +
                    canonicalUri + "\n" +
                    "\n" + // empty query string
                    canonicalHeaders + "\n" +
                    signedHeaders + "\n" +
                    payloadHash;

            // Create string to sign
            String credentialScope = dateStamp + "/" + region + "/" + service + "/aws4_request";
            String stringToSign = ALGORITHM + "\n" +
                    amzDate + "\n" +
                    credentialScope + "\n" +
                    sha256Hex(canonicalRequest);

            // Calculate signature
            byte[] signingKey = getSignatureKey(secretKey, dateStamp, region, service);
            String signature = bytesToHex(hmacSha256(signingKey, stringToSign));

            // Create authorization header
            String authorization = ALGORITHM + " " +
                    "Credential=" + accessKey + "/" + credentialScope + ", " +
                    "SignedHeaders=" + signedHeaders + ", " +
                    "Signature=" + signature;

            return new String[]{
                    "Authorization:" + authorization,
                    "x-amz-date:" + amzDate,
                    "x-amz-content-sha256:" + payloadHash,
                    "Host:" + host
            };
        }

        private static byte[] getSignatureKey(String key, String dateStamp, String region, String service) throws Exception {
            byte[] kSecret = ("AWS4" + key).getBytes(StandardCharsets.UTF_8);
            byte[] kDate = hmacSha256(kSecret, dateStamp);
            byte[] kRegion = hmacSha256(kDate, region);
            byte[] kService = hmacSha256(kRegion, service);
            return hmacSha256(kService, "aws4_request");
        }

        private static byte[] hmacSha256(byte[] key, String data) throws Exception {
            javax.crypto.Mac mac = javax.crypto.Mac.getInstance("HmacSHA256");
            mac.init(new javax.crypto.spec.SecretKeySpec(key, "HmacSHA256"));
            return mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
        }

        private static String sha256Hex(String data) throws Exception {
            java.security.MessageDigest digest = java.security.MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(data.getBytes(StandardCharsets.UTF_8));
            return bytesToHex(hash);
        }

        private static String bytesToHex(byte[] bytes) {
            StringBuilder sb = new StringBuilder();
            for (byte b : bytes) {
                sb.append(String.format("%02x", b));
            }
            return sb.toString();
        }
    }
}
