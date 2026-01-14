package com.nuraly.workflows.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.nuraly.workflows.dto.ValidationResult;
import com.nuraly.workflows.entity.WorkflowEntity;
import com.nuraly.workflows.entity.WorkflowNodeEntity;
import com.nuraly.workflows.entity.enums.NodeType;
import com.nuraly.workflows.entity.enums.WorkflowStatus;
import io.quarkus.test.junit.QuarkusTest;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.ArrayList;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

@QuarkusTest
@Transactional
class WorkflowServiceHttpValidationTest {

    @Inject
    WorkflowService workflowService;

    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        objectMapper = new ObjectMapper();
    }

    @Test
    void testValidateWorkflowWithHttpStartAndHttpEnd() throws Exception {
        WorkflowEntity workflow = createWorkflowWithNodes(NodeType.HTTP_START, NodeType.HTTP_END);
        workflow.persist();

        ValidationResult result = workflowService.validateWorkflow(workflow.id);

        assertTrue(result.isValid());
        assertTrue(result.getErrors().isEmpty());
    }

    @Test
    void testValidateWorkflowWithHttpStartOnly() throws Exception {
        WorkflowEntity workflow = createWorkflowWithNodes(NodeType.HTTP_START, NodeType.END);
        workflow.persist();

        ValidationResult result = workflowService.validateWorkflow(workflow.id);

        // Should be valid but with warning
        assertTrue(result.isValid());
        assertTrue(result.getWarnings().stream()
                .anyMatch(w -> w.contains("HTTP_START but no HTTP_END")));
    }

    @Test
    void testValidateWorkflowWithStartAndEnd() throws Exception {
        WorkflowEntity workflow = createWorkflowWithNodes(NodeType.START, NodeType.END);
        workflow.persist();

        ValidationResult result = workflowService.validateWorkflow(workflow.id);

        assertTrue(result.isValid());
    }

    @Test
    void testValidateHttpStartNodeConfiguration() throws Exception {
        WorkflowEntity workflow = new WorkflowEntity();
        workflow.name = "Test Workflow";
        workflow.applicationId = "app-" + UUID.randomUUID();
        workflow.status = WorkflowStatus.DRAFT;
        workflow.nodes = new ArrayList<>();
        workflow.edges = new ArrayList<>();
        workflow.persist();

        // Create HTTP_START node with valid config
        WorkflowNodeEntity httpStartNode = new WorkflowNodeEntity();
        httpStartNode.workflow = workflow;
        httpStartNode.name = "HTTP Trigger";
        httpStartNode.type = NodeType.HTTP_START;

        ObjectNode config = objectMapper.createObjectNode();
        config.put("httpPath", "/api/test");
        ArrayNode methods = objectMapper.createArrayNode();
        methods.add("POST");
        methods.add("PUT");
        config.set("httpMethods", methods);
        config.put("httpAuth", "bearer");

        httpStartNode.configuration = objectMapper.writeValueAsString(config);
        httpStartNode.persist();
        workflow.nodes.add(httpStartNode);

        // Add END node
        WorkflowNodeEntity endNode = new WorkflowNodeEntity();
        endNode.workflow = workflow;
        endNode.name = "End";
        endNode.type = NodeType.HTTP_END;
        endNode.persist();
        workflow.nodes.add(endNode);

        ValidationResult result = workflowService.validateWorkflow(workflow.id);

        assertTrue(result.isValid());
    }

    @Test
    void testValidateHttpStartNodeWithInvalidMethod() throws Exception {
        WorkflowEntity workflow = new WorkflowEntity();
        workflow.name = "Test Workflow";
        workflow.applicationId = "app-" + UUID.randomUUID();
        workflow.status = WorkflowStatus.DRAFT;
        workflow.nodes = new ArrayList<>();
        workflow.edges = new ArrayList<>();
        workflow.persist();

        WorkflowNodeEntity httpStartNode = new WorkflowNodeEntity();
        httpStartNode.workflow = workflow;
        httpStartNode.name = "HTTP Trigger";
        httpStartNode.type = NodeType.HTTP_START;

        ObjectNode config = objectMapper.createObjectNode();
        config.put("httpPath", "/api/test");
        ArrayNode methods = objectMapper.createArrayNode();
        methods.add("INVALID_METHOD");
        config.set("httpMethods", methods);

        httpStartNode.configuration = objectMapper.writeValueAsString(config);
        httpStartNode.persist();
        workflow.nodes.add(httpStartNode);

        WorkflowNodeEntity endNode = new WorkflowNodeEntity();
        endNode.workflow = workflow;
        endNode.name = "End";
        endNode.type = NodeType.HTTP_END;
        endNode.persist();
        workflow.nodes.add(endNode);

        ValidationResult result = workflowService.validateWorkflow(workflow.id);

        assertFalse(result.isValid());
        assertTrue(result.getErrors().stream()
                .anyMatch(e -> e.contains("invalid HTTP method")));
    }

    @Test
    void testValidateHttpStartNodeWithInvalidAuth() throws Exception {
        WorkflowEntity workflow = new WorkflowEntity();
        workflow.name = "Test Workflow";
        workflow.applicationId = "app-" + UUID.randomUUID();
        workflow.status = WorkflowStatus.DRAFT;
        workflow.nodes = new ArrayList<>();
        workflow.edges = new ArrayList<>();
        workflow.persist();

        WorkflowNodeEntity httpStartNode = new WorkflowNodeEntity();
        httpStartNode.workflow = workflow;
        httpStartNode.name = "HTTP Trigger";
        httpStartNode.type = NodeType.HTTP_START;

        ObjectNode config = objectMapper.createObjectNode();
        config.put("httpPath", "/api/test");
        config.put("httpAuth", "invalid_auth");

        httpStartNode.configuration = objectMapper.writeValueAsString(config);
        httpStartNode.persist();
        workflow.nodes.add(httpStartNode);

        WorkflowNodeEntity endNode = new WorkflowNodeEntity();
        endNode.workflow = workflow;
        endNode.name = "End";
        endNode.type = NodeType.HTTP_END;
        endNode.persist();
        workflow.nodes.add(endNode);

        ValidationResult result = workflowService.validateWorkflow(workflow.id);

        assertFalse(result.isValid());
        assertTrue(result.getErrors().stream()
                .anyMatch(e -> e.contains("invalid httpAuth")));
    }

    @Test
    void testValidateHttpEndNodeWithInvalidStatusCode() throws Exception {
        WorkflowEntity workflow = new WorkflowEntity();
        workflow.name = "Test Workflow";
        workflow.applicationId = "app-" + UUID.randomUUID();
        workflow.status = WorkflowStatus.DRAFT;
        workflow.nodes = new ArrayList<>();
        workflow.edges = new ArrayList<>();
        workflow.persist();

        WorkflowNodeEntity startNode = new WorkflowNodeEntity();
        startNode.workflow = workflow;
        startNode.name = "Start";
        startNode.type = NodeType.HTTP_START;
        startNode.persist();
        workflow.nodes.add(startNode);

        WorkflowNodeEntity httpEndNode = new WorkflowNodeEntity();
        httpEndNode.workflow = workflow;
        httpEndNode.name = "HTTP Response";
        httpEndNode.type = NodeType.HTTP_END;

        ObjectNode config = objectMapper.createObjectNode();
        config.put("httpStatusCode", 999); // Invalid status code

        httpEndNode.configuration = objectMapper.writeValueAsString(config);
        httpEndNode.persist();
        workflow.nodes.add(httpEndNode);

        ValidationResult result = workflowService.validateWorkflow(workflow.id);

        assertFalse(result.isValid());
        assertTrue(result.getErrors().stream()
                .anyMatch(e -> e.contains("invalid status code")));
    }

    @Test
    void testValidatePathMethodConflictWithinWorkflow() throws Exception {
        WorkflowEntity workflow = new WorkflowEntity();
        workflow.name = "Test Workflow";
        workflow.applicationId = "app-" + UUID.randomUUID();
        workflow.status = WorkflowStatus.DRAFT;
        workflow.nodes = new ArrayList<>();
        workflow.edges = new ArrayList<>();
        workflow.persist();

        // Create first HTTP_START node
        WorkflowNodeEntity httpStart1 = new WorkflowNodeEntity();
        httpStart1.workflow = workflow;
        httpStart1.name = "HTTP Trigger 1";
        httpStart1.type = NodeType.HTTP_START;

        ObjectNode config1 = objectMapper.createObjectNode();
        config1.put("httpPath", "/api/users");
        ArrayNode methods1 = objectMapper.createArrayNode();
        methods1.add("POST");
        config1.set("httpMethods", methods1);
        httpStart1.configuration = objectMapper.writeValueAsString(config1);
        httpStart1.persist();
        workflow.nodes.add(httpStart1);

        // Create second HTTP_START node with same path/method
        WorkflowNodeEntity httpStart2 = new WorkflowNodeEntity();
        httpStart2.workflow = workflow;
        httpStart2.name = "HTTP Trigger 2";
        httpStart2.type = NodeType.HTTP_START;

        ObjectNode config2 = objectMapper.createObjectNode();
        config2.put("httpPath", "/api/users");
        ArrayNode methods2 = objectMapper.createArrayNode();
        methods2.add("POST");
        config2.set("httpMethods", methods2);
        httpStart2.configuration = objectMapper.writeValueAsString(config2);
        httpStart2.persist();
        workflow.nodes.add(httpStart2);

        // Add END node
        WorkflowNodeEntity endNode = new WorkflowNodeEntity();
        endNode.workflow = workflow;
        endNode.name = "End";
        endNode.type = NodeType.HTTP_END;
        endNode.persist();
        workflow.nodes.add(endNode);

        ValidationResult result = workflowService.validateWorkflow(workflow.id);

        assertFalse(result.isValid());
        assertTrue(result.getErrors().stream()
                .anyMatch(e -> e.contains("conflicting path/method")));
    }

    @Test
    void testNoConflictWithDifferentMethods() throws Exception {
        WorkflowEntity workflow = new WorkflowEntity();
        workflow.name = "Test Workflow";
        workflow.applicationId = "app-" + UUID.randomUUID();
        workflow.status = WorkflowStatus.DRAFT;
        workflow.nodes = new ArrayList<>();
        workflow.edges = new ArrayList<>();
        workflow.persist();

        // Create first HTTP_START node with POST
        WorkflowNodeEntity httpStart1 = new WorkflowNodeEntity();
        httpStart1.workflow = workflow;
        httpStart1.name = "HTTP Trigger POST";
        httpStart1.type = NodeType.HTTP_START;

        ObjectNode config1 = objectMapper.createObjectNode();
        config1.put("httpPath", "/api/users");
        ArrayNode methods1 = objectMapper.createArrayNode();
        methods1.add("POST");
        config1.set("httpMethods", methods1);
        httpStart1.configuration = objectMapper.writeValueAsString(config1);
        httpStart1.persist();
        workflow.nodes.add(httpStart1);

        // Create second HTTP_START node with GET (different method, same path)
        WorkflowNodeEntity httpStart2 = new WorkflowNodeEntity();
        httpStart2.workflow = workflow;
        httpStart2.name = "HTTP Trigger GET";
        httpStart2.type = NodeType.HTTP_START;

        ObjectNode config2 = objectMapper.createObjectNode();
        config2.put("httpPath", "/api/users");
        ArrayNode methods2 = objectMapper.createArrayNode();
        methods2.add("GET");
        config2.set("httpMethods", methods2);
        httpStart2.configuration = objectMapper.writeValueAsString(config2);
        httpStart2.persist();
        workflow.nodes.add(httpStart2);

        // Add END node
        WorkflowNodeEntity endNode = new WorkflowNodeEntity();
        endNode.workflow = workflow;
        endNode.name = "End";
        endNode.type = NodeType.HTTP_END;
        endNode.persist();
        workflow.nodes.add(endNode);

        ValidationResult result = workflowService.validateWorkflow(workflow.id);

        // Should be valid since methods are different
        assertTrue(result.isValid());
    }

    @Test
    void testNoConflictWithDifferentPaths() throws Exception {
        WorkflowEntity workflow = new WorkflowEntity();
        workflow.name = "Test Workflow";
        workflow.applicationId = "app-" + UUID.randomUUID();
        workflow.status = WorkflowStatus.DRAFT;
        workflow.nodes = new ArrayList<>();
        workflow.edges = new ArrayList<>();
        workflow.persist();

        // Create first HTTP_START node
        WorkflowNodeEntity httpStart1 = new WorkflowNodeEntity();
        httpStart1.workflow = workflow;
        httpStart1.name = "HTTP Trigger Users";
        httpStart1.type = NodeType.HTTP_START;

        ObjectNode config1 = objectMapper.createObjectNode();
        config1.put("httpPath", "/api/users");
        ArrayNode methods1 = objectMapper.createArrayNode();
        methods1.add("POST");
        config1.set("httpMethods", methods1);
        httpStart1.configuration = objectMapper.writeValueAsString(config1);
        httpStart1.persist();
        workflow.nodes.add(httpStart1);

        // Create second HTTP_START node with different path
        WorkflowNodeEntity httpStart2 = new WorkflowNodeEntity();
        httpStart2.workflow = workflow;
        httpStart2.name = "HTTP Trigger Orders";
        httpStart2.type = NodeType.HTTP_START;

        ObjectNode config2 = objectMapper.createObjectNode();
        config2.put("httpPath", "/api/orders");
        ArrayNode methods2 = objectMapper.createArrayNode();
        methods2.add("POST");
        config2.set("httpMethods", methods2);
        httpStart2.configuration = objectMapper.writeValueAsString(config2);
        httpStart2.persist();
        workflow.nodes.add(httpStart2);

        // Add END node
        WorkflowNodeEntity endNode = new WorkflowNodeEntity();
        endNode.workflow = workflow;
        endNode.name = "End";
        endNode.type = NodeType.HTTP_END;
        endNode.persist();
        workflow.nodes.add(endNode);

        ValidationResult result = workflowService.validateWorkflow(workflow.id);

        // Should be valid since paths are different
        assertTrue(result.isValid());
    }

    private WorkflowEntity createWorkflowWithNodes(NodeType startType, NodeType endType) {
        WorkflowEntity workflow = new WorkflowEntity();
        workflow.name = "Test Workflow";
        workflow.applicationId = "app-" + UUID.randomUUID();
        workflow.status = WorkflowStatus.DRAFT;
        workflow.nodes = new ArrayList<>();
        workflow.edges = new ArrayList<>();
        workflow.persist();

        WorkflowNodeEntity startNode = new WorkflowNodeEntity();
        startNode.workflow = workflow;
        startNode.name = "Start";
        startNode.type = startType;
        startNode.persist();
        workflow.nodes.add(startNode);

        WorkflowNodeEntity endNode = new WorkflowNodeEntity();
        endNode.workflow = workflow;
        endNode.name = "End";
        endNode.type = endType;
        endNode.persist();
        workflow.nodes.add(endNode);

        return workflow;
    }
}
