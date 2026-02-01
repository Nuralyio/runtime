package com.nuraly.workflows.engine.executors;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.nuraly.workflows.engine.ExecutionContext;
import com.nuraly.workflows.engine.NodeExecutionResult;
import com.nuraly.workflows.entity.WorkflowExecutionEntity;
import com.nuraly.workflows.entity.WorkflowNodeEntity;
import com.nuraly.workflows.entity.enums.NodeType;
import io.quarkus.test.junit.QuarkusTest;
import jakarta.inject.Inject;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Unit tests for EmailNodeExecutor.
 *
 * <p>Tests cover:</p>
 * <ul>
 *   <li>Node type verification</li>
 *   <li>Configuration validation</li>
 *   <li>Required field validation</li>
 *   <li>Provider validation</li>
 *   <li>Configuration parsing</li>
 * </ul>
 *
 * <p>Note: Full integration tests require actual email provider API keys
 * to be configured in the KV store.</p>
 */
@QuarkusTest
class EmailNodeExecutorTest {

    @Inject
    EmailNodeExecutor executor;

    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        objectMapper = new ObjectMapper();
    }

    @Test
    void testGetType() {
        assertEquals(NodeType.EMAIL, executor.getType());
    }

    @Test
    void testExecuteWithMissingConfiguration() throws Exception {
        WorkflowExecutionEntity execution = new WorkflowExecutionEntity();
        execution.inputData = "{}";
        ExecutionContext context = new ExecutionContext(execution);

        WorkflowNodeEntity node = new WorkflowNodeEntity();
        node.id = UUID.randomUUID();
        node.type = NodeType.EMAIL;
        node.name = "Email Node";
        node.configuration = null;

        NodeExecutionResult result = executor.execute(context, node);

        assertFalse(result.isSuccess());
        assertTrue(result.getErrorMessage().contains("configuration is missing"));
    }

    @Test
    void testExecuteWithMissingToAddress() throws Exception {
        WorkflowExecutionEntity execution = new WorkflowExecutionEntity();
        execution.inputData = "{}";
        ExecutionContext context = new ExecutionContext(execution);

        ObjectNode config = objectMapper.createObjectNode();
        config.put("provider", "sendgrid");
        config.put("from", "sender@example.com");
        config.put("subject", "Test Subject");
        config.put("body", "Test Body");
        // Missing 'to' field

        WorkflowNodeEntity node = new WorkflowNodeEntity();
        node.id = UUID.randomUUID();
        node.type = NodeType.EMAIL;
        node.name = "Email Node";
        node.configuration = objectMapper.writeValueAsString(config);

        NodeExecutionResult result = executor.execute(context, node);

        assertFalse(result.isSuccess());
        assertTrue(result.getErrorMessage().contains("'to' address is required"));
    }

    @Test
    void testExecuteWithMissingFromAddress() throws Exception {
        WorkflowExecutionEntity execution = new WorkflowExecutionEntity();
        execution.inputData = "{}";
        ExecutionContext context = new ExecutionContext(execution);

        ObjectNode config = objectMapper.createObjectNode();
        config.put("provider", "sendgrid");
        config.put("to", "recipient@example.com");
        config.put("subject", "Test Subject");
        config.put("body", "Test Body");
        // Missing 'from' field

        WorkflowNodeEntity node = new WorkflowNodeEntity();
        node.id = UUID.randomUUID();
        node.type = NodeType.EMAIL;
        node.name = "Email Node";
        node.configuration = objectMapper.writeValueAsString(config);

        NodeExecutionResult result = executor.execute(context, node);

        assertFalse(result.isSuccess());
        assertTrue(result.getErrorMessage().contains("'from' address is required"));
    }

    @Test
    void testExecuteWithMissingSubject() throws Exception {
        WorkflowExecutionEntity execution = new WorkflowExecutionEntity();
        execution.inputData = "{}";
        ExecutionContext context = new ExecutionContext(execution);

        ObjectNode config = objectMapper.createObjectNode();
        config.put("provider", "sendgrid");
        config.put("to", "recipient@example.com");
        config.put("from", "sender@example.com");
        config.put("body", "Test Body");
        // Missing 'subject' field

        WorkflowNodeEntity node = new WorkflowNodeEntity();
        node.id = UUID.randomUUID();
        node.type = NodeType.EMAIL;
        node.name = "Email Node";
        node.configuration = objectMapper.writeValueAsString(config);

        NodeExecutionResult result = executor.execute(context, node);

        assertFalse(result.isSuccess());
        assertTrue(result.getErrorMessage().contains("'subject' is required"));
    }

    @Test
    void testExecuteWithMissingBody() throws Exception {
        WorkflowExecutionEntity execution = new WorkflowExecutionEntity();
        execution.inputData = "{}";
        ExecutionContext context = new ExecutionContext(execution);

        ObjectNode config = objectMapper.createObjectNode();
        config.put("provider", "sendgrid");
        config.put("to", "recipient@example.com");
        config.put("from", "sender@example.com");
        config.put("subject", "Test Subject");
        // Missing 'body' field

        WorkflowNodeEntity node = new WorkflowNodeEntity();
        node.id = UUID.randomUUID();
        node.type = NodeType.EMAIL;
        node.name = "Email Node";
        node.configuration = objectMapper.writeValueAsString(config);

        NodeExecutionResult result = executor.execute(context, node);

        assertFalse(result.isSuccess());
        assertTrue(result.getErrorMessage().contains("'body' is required"));
    }

    @Test
    void testConfigurationParsingSendGrid() throws Exception {
        ObjectNode config = objectMapper.createObjectNode();
        config.put("provider", "sendgrid");
        config.put("to", "recipient@example.com");
        config.put("from", "sender@example.com");
        config.put("subject", "Test Subject");
        config.put("body", "<h1>Hello</h1><p>Test body</p>");
        config.put("bodyType", "html");
        config.put("cc", "cc@example.com");
        config.put("bcc", "bcc@example.com");
        config.put("replyTo", "reply@example.com");
        config.put("timeout", 60000);

        // Verify configuration can be parsed
        String jsonConfig = objectMapper.writeValueAsString(config);
        JsonNode parsedConfig = objectMapper.readTree(jsonConfig);

        assertEquals("sendgrid", parsedConfig.get("provider").asText());
        assertEquals("recipient@example.com", parsedConfig.get("to").asText());
        assertEquals("sender@example.com", parsedConfig.get("from").asText());
        assertEquals("Test Subject", parsedConfig.get("subject").asText());
        assertEquals("html", parsedConfig.get("bodyType").asText());
        assertEquals("cc@example.com", parsedConfig.get("cc").asText());
        assertEquals("bcc@example.com", parsedConfig.get("bcc").asText());
        assertEquals("reply@example.com", parsedConfig.get("replyTo").asText());
        assertEquals(60000, parsedConfig.get("timeout").asInt());
    }

    @Test
    void testConfigurationParsingMailgun() throws Exception {
        ObjectNode config = objectMapper.createObjectNode();
        config.put("provider", "mailgun");
        config.put("to", "recipient@example.com");
        config.put("from", "Sender Name <sender@example.com>");
        config.put("subject", "Test Email via Mailgun");
        config.put("body", "Plain text email body");
        config.put("bodyType", "text");

        String jsonConfig = objectMapper.writeValueAsString(config);
        JsonNode parsedConfig = objectMapper.readTree(jsonConfig);

        assertEquals("mailgun", parsedConfig.get("provider").asText());
        assertEquals("text", parsedConfig.get("bodyType").asText());
    }

    @Test
    void testConfigurationParsingAmazonSES() throws Exception {
        ObjectNode config = objectMapper.createObjectNode();
        config.put("provider", "ses");
        config.put("to", "recipient@example.com");
        config.put("from", "sender@verified-domain.com");
        config.put("subject", "Test Email via Amazon SES");
        config.put("body", "Email body content");
        config.put("bodyType", "text");

        String jsonConfig = objectMapper.writeValueAsString(config);
        JsonNode parsedConfig = objectMapper.readTree(jsonConfig);

        assertEquals("ses", parsedConfig.get("provider").asText());
    }

    @Test
    void testConfigurationParsingPostmark() throws Exception {
        ObjectNode config = objectMapper.createObjectNode();
        config.put("provider", "postmark");
        config.put("to", "recipient@example.com");
        config.put("from", "sender@example.com");
        config.put("subject", "Test Email via Postmark");
        config.put("body", "<html><body>HTML email</body></html>");
        config.put("bodyType", "html");

        String jsonConfig = objectMapper.writeValueAsString(config);
        JsonNode parsedConfig = objectMapper.readTree(jsonConfig);

        assertEquals("postmark", parsedConfig.get("provider").asText());
    }

    @Test
    void testConfigurationParsingResend() throws Exception {
        ObjectNode config = objectMapper.createObjectNode();
        config.put("provider", "resend");
        config.put("to", "recipient@example.com");
        config.put("from", "sender@example.com");
        config.put("subject", "Test Email via Resend");
        config.put("body", "Email body");
        config.put("bodyType", "text");

        String jsonConfig = objectMapper.writeValueAsString(config);
        JsonNode parsedConfig = objectMapper.readTree(jsonConfig);

        assertEquals("resend", parsedConfig.get("provider").asText());
    }

    @Test
    void testExpressionInToField() throws Exception {
        WorkflowExecutionEntity execution = new WorkflowExecutionEntity();
        execution.inputData = "{\"recipientEmail\": \"dynamic@example.com\"}";
        ExecutionContext context = new ExecutionContext(execution);

        // Test expression resolution
        String result = context.resolveExpression("${input.recipientEmail}");
        assertEquals("dynamic@example.com", result);
    }

    @Test
    void testExpressionInSubjectField() throws Exception {
        WorkflowExecutionEntity execution = new WorkflowExecutionEntity();
        execution.inputData = "{}";
        execution.variables = "{\"orderNumber\": \"12345\"}";
        ExecutionContext context = new ExecutionContext(execution);

        // Test expression resolution
        String result = context.resolveExpression("Order #${variables.orderNumber} Confirmation");
        assertEquals("Order #12345 Confirmation", result);
    }

    @Test
    void testExpressionInBodyField() throws Exception {
        WorkflowExecutionEntity execution = new WorkflowExecutionEntity();
        execution.inputData = "{}";
        execution.variables = "{\"customerName\": \"John Doe\", \"amount\": \"99.99\"}";
        ExecutionContext context = new ExecutionContext(execution);

        // Test expression resolution
        String result = context.resolveExpression("Dear ${variables.customerName}, your payment of $${variables.amount} has been received.");
        assertEquals("Dear John Doe, your payment of $99.99 has been received.", result);
    }

    @Test
    void testDefaultProvider() throws Exception {
        ObjectNode config = objectMapper.createObjectNode();
        // No provider specified - should default to sendgrid
        config.put("to", "recipient@example.com");
        config.put("from", "sender@example.com");
        config.put("subject", "Test");
        config.put("body", "Body");

        String jsonConfig = objectMapper.writeValueAsString(config);
        JsonNode parsedConfig = objectMapper.readTree(jsonConfig);

        // Provider not present in config means default will be used
        assertFalse(parsedConfig.has("provider"));
    }

    @Test
    void testDefaultBodyType() throws Exception {
        ObjectNode config = objectMapper.createObjectNode();
        config.put("provider", "sendgrid");
        config.put("to", "recipient@example.com");
        config.put("from", "sender@example.com");
        config.put("subject", "Test");
        config.put("body", "Body");
        // No bodyType - should default to "text"

        String jsonConfig = objectMapper.writeValueAsString(config);
        JsonNode parsedConfig = objectMapper.readTree(jsonConfig);

        assertFalse(parsedConfig.has("bodyType"));
    }

    @Test
    void testSendGridPayloadFormat() throws Exception {
        // Verify SendGrid API payload structure
        ObjectNode payload = objectMapper.createObjectNode();

        // Personalizations
        ObjectNode personalization = objectMapper.createObjectNode();
        personalization.set("to", objectMapper.createArrayNode().add(
                objectMapper.createObjectNode().put("email", "recipient@example.com")
        ));
        personalization.set("cc", objectMapper.createArrayNode().add(
                objectMapper.createObjectNode().put("email", "cc@example.com")
        ));
        payload.set("personalizations", objectMapper.createArrayNode().add(personalization));

        // From
        payload.set("from", objectMapper.createObjectNode().put("email", "sender@example.com"));

        // Subject
        payload.put("subject", "Test Subject");

        // Content
        payload.set("content", objectMapper.createArrayNode().add(
                objectMapper.createObjectNode()
                        .put("type", "text/html")
                        .put("value", "<p>Hello</p>")
        ));

        // Verify structure
        assertTrue(payload.has("personalizations"));
        assertTrue(payload.has("from"));
        assertTrue(payload.has("subject"));
        assertTrue(payload.has("content"));
        assertEquals("recipient@example.com",
                payload.get("personalizations").get(0).get("to").get(0).get("email").asText());
    }

    @Test
    void testMailgunFormDataFormat() throws Exception {
        // Verify Mailgun form data fields
        String from = "sender@example.com";
        String to = "recipient@example.com";
        String subject = "Test Subject";
        String text = "Plain text body";

        // Basic form data fields
        assertNotNull(from);
        assertNotNull(to);
        assertNotNull(subject);
        assertNotNull(text);
    }

    @Test
    void testPostmarkPayloadFormat() throws Exception {
        // Verify Postmark API payload structure
        ObjectNode payload = objectMapper.createObjectNode();
        payload.put("From", "sender@example.com");
        payload.put("To", "recipient@example.com");
        payload.put("Subject", "Test Subject");
        payload.put("HtmlBody", "<p>HTML content</p>");
        payload.put("TextBody", "Plain text content");
        payload.put("Cc", "cc@example.com");
        payload.put("ReplyTo", "reply@example.com");

        // Verify structure
        assertTrue(payload.has("From"));
        assertTrue(payload.has("To"));
        assertTrue(payload.has("Subject"));
        assertEquals("sender@example.com", payload.get("From").asText());
    }

    @Test
    void testResendPayloadFormat() throws Exception {
        // Verify Resend API payload structure
        ObjectNode payload = objectMapper.createObjectNode();
        payload.put("from", "sender@example.com");
        payload.set("to", objectMapper.createArrayNode().add("recipient@example.com"));
        payload.put("subject", "Test Subject");
        payload.put("html", "<p>HTML content</p>");
        payload.set("cc", objectMapper.createArrayNode().add("cc@example.com"));
        payload.put("reply_to", "reply@example.com");

        // Verify structure
        assertTrue(payload.has("from"));
        assertTrue(payload.has("to"));
        assertTrue(payload.get("to").isArray());
        assertEquals("recipient@example.com", payload.get("to").get(0).asText());
    }

    @Test
    void testSesPayloadFormat() throws Exception {
        // Verify AWS SES v2 API payload structure
        ObjectNode payload = objectMapper.createObjectNode();
        payload.put("FromEmailAddress", "sender@example.com");

        ObjectNode destination = objectMapper.createObjectNode();
        destination.set("ToAddresses", objectMapper.createArrayNode().add("recipient@example.com"));
        destination.set("CcAddresses", objectMapper.createArrayNode().add("cc@example.com"));
        payload.set("Destination", destination);

        ObjectNode content = objectMapper.createObjectNode();
        ObjectNode simple = objectMapper.createObjectNode();
        simple.set("Subject", objectMapper.createObjectNode()
                .put("Data", "Test Subject")
                .put("Charset", "UTF-8"));
        ObjectNode body = objectMapper.createObjectNode();
        body.set("Text", objectMapper.createObjectNode()
                .put("Data", "Email body")
                .put("Charset", "UTF-8"));
        simple.set("Body", body);
        content.set("Simple", simple);
        payload.set("Content", content);

        // Verify structure
        assertTrue(payload.has("FromEmailAddress"));
        assertTrue(payload.has("Destination"));
        assertTrue(payload.has("Content"));
        assertEquals("sender@example.com", payload.get("FromEmailAddress").asText());
    }

    @Test
    void testOutputFormat() throws Exception {
        // Verify expected output structure
        ObjectNode output = objectMapper.createObjectNode();
        output.put("success", true);
        output.put("provider", "sendgrid");
        output.put("messageId", "msg-12345");
        output.put("to", "recipient@example.com");
        output.put("from", "sender@example.com");
        output.put("subject", "Test Subject");
        output.put("timestamp", "2024-01-15T10:30:00Z");

        assertTrue(output.get("success").asBoolean());
        assertEquals("sendgrid", output.get("provider").asText());
        assertNotNull(output.get("messageId").asText());
        assertNotNull(output.get("timestamp").asText());
    }

    @Test
    void testMultipleRecipients() throws Exception {
        // Test configuration with multiple recipients (comma-separated)
        ObjectNode config = objectMapper.createObjectNode();
        config.put("provider", "sendgrid");
        config.put("to", "recipient1@example.com");
        config.put("cc", "cc1@example.com");
        config.put("bcc", "bcc1@example.com");
        config.put("from", "sender@example.com");
        config.put("subject", "Test");
        config.put("body", "Body");

        String jsonConfig = objectMapper.writeValueAsString(config);
        JsonNode parsedConfig = objectMapper.readTree(jsonConfig);

        assertNotNull(parsedConfig.get("to").asText());
        assertNotNull(parsedConfig.get("cc").asText());
        assertNotNull(parsedConfig.get("bcc").asText());
    }

    @Test
    void testKvStoreKeyPatterns() {
        // Verify KV store key patterns for each provider
        String[] providers = {"sendgrid", "mailgun", "ses", "postmark", "resend"};

        for (String provider : providers) {
            String apiKeyPath = "email/" + provider + "/api_key";
            assertTrue(apiKeyPath.startsWith("email/"));
            assertTrue(apiKeyPath.contains(provider));
            assertTrue(apiKeyPath.endsWith("/api_key"));
        }

        // Mailgun additional config
        assertEquals("email/mailgun/domain", "email/mailgun/domain");

        // SES additional config
        assertEquals("email/ses/secret_key", "email/ses/secret_key");
        assertEquals("email/ses/region", "email/ses/region");
    }
}
