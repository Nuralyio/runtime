package com.nuraly.workflows.entity.enums;

public enum NodeType {
    // Workflow nodes
    START,          // Entry point
    END,            // Exit point
    HTTP_START,     // HTTP trigger - start workflow from HTTP request
    HTTP_END,       // HTTP response - return response to HTTP caller
    CHAT_START,     // Chatbot trigger - start workflow from chatbot message
    CHAT_OUTPUT,    // Chatbot output - send message to chatbot during execution
    FUNCTION,       // Invoke nuraly function
    HTTP,           // HTTP request
    CONDITION,      // If/else branching
    DELAY,          // Wait for duration
    PARALLEL,       // Execute branches in parallel
    LOOP,           // Iterate over array
    TRANSFORM,      // Data transformation (JSONata/JavaScript)
    SUB_WORKFLOW,   // Invoke another workflow
    EMAIL,          // Send email
    NOTIFICATION,   // Send notification
    DATABASE,       // Database operation
    VARIABLE,       // Set/get variable
    DEBUG,          // Debug node - displays input, output, variables
    OCR,            // OCR - extract text from images/documents using PaddleOCR
    LLM,            // LLM node - call AI providers (OpenAI, Anthropic, Gemini) with tool calling
    CHATBOT,        // Chatbot trigger - legacy/alternative chatbot trigger

    // Agent nodes
    AGENT,          // Autonomous AI agent that can use tools
    TOOL,           // A tool that can be used by an agent
    MEMORY,         // Conversation memory for agents
    PROMPT,         // Prompt template for LLM
    RETRIEVER,      // Retrieve relevant documents from vector store
    CHAIN,          // Chain multiple LLM calls together
    ROUTER,         // Route to different chains based on input
    HUMAN_INPUT,    // Wait for human input in the workflow
    OUTPUT_PARSER,  // Parse LLM output into structured data

    // DB Designer nodes
    DB_TABLE,       // Database table definition
    DB_VIEW,        // Database view definition
    DB_INDEX,       // Database index definition
    DB_RELATIONSHIP,// Foreign key relationship
    DB_CONSTRAINT,  // Database constraint
    DB_QUERY        // Saved query or stored procedure
}
