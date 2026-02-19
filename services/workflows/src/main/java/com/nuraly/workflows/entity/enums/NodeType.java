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

    // Slack integration nodes
    SLACK_SEND_MESSAGE,     // Send message to Slack channel or user
    SLACK_GET_CHANNEL_INFO, // Get information about a Slack channel
    SLACK_LIST_CHANNELS,    // List available Slack channels
    SLACK_ADD_REACTION,     // Add reaction emoji to a Slack message
    SLACK_UPLOAD_FILE,      // Upload file to Slack channel

    // Agent nodes
    AGENT,          // Autonomous AI agent that can use tools
    AGENT_LLM,      // LLM node - agent variant (config node for AGENT, distinct from workflow LLM)
    TOOL,           // A tool that can be used by an agent
    MEMORY,         // Conversation memory for agents
    CONTEXT_MEMORY, // RAG-enhanced conversation memory (buffer, semantic, hybrid)
    GUARDRAIL,      // Input/output validation and safety checks
    PROMPT,         // Prompt template for LLM
    RETRIEVER,      // Retrieve relevant documents from vector store
    CHAIN,          // Chain multiple LLM calls together
    ROUTER,         // Route to different chains based on input
    HUMAN_INPUT,    // Wait for human input in the workflow
    OUTPUT_PARSER,  // Parse LLM output into structured data

    // RAG nodes (Retrieval-Augmented Generation)
    EMBEDDING,      // Generate vector embeddings from text (OpenAI, Ollama, Local ONNX)
    DOCUMENT_LOADER,// Load and parse documents (PDF, Word, HTML, etc.) - Phase 2
    TEXT_SPLITTER,  // Split text into chunks for embedding - Phase 2
    VECTOR_WRITE,   // Write vectors to PGVector store - Phase 2
    VECTOR_SEARCH,  // Search vectors by similarity - Phase 3
    CONTEXT_BUILDER,// Build context from retrieved documents - Phase 3
    RERANKER,       // Re-rank search results - Phase 4

    // Document generation
    DOCUMENT_GENERATOR, // Generate Word documents from templates via document-generator service

    // Storage nodes
    FILE_STORAGE,   // Store files to S3, MinIO, or local filesystem

    // Web nodes
    WEB_SEARCH,     // Search the web using multiple providers (Google, Bing, SerpAPI, Brave, DuckDuckGo)
    WEB_CRAWL,      // Crawl web pages and extract text content

    // MCP integration
    MCP,            // Persistent MCP server connection (tool provider for Agent/LLM)

    // DB Designer nodes
    DB_TABLE,       // Database table definition
    DB_VIEW,        // Database view definition
    DB_INDEX,       // Database index definition
    DB_RELATIONSHIP,// Foreign key relationship
    DB_CONSTRAINT,  // Database constraint
    DB_QUERY,       // Saved query or stored procedure

    // Display nodes
    UI_TABLE,       // Display data as an interactive table

    // Telegram integration nodes
    TELEGRAM_SEND,      // Send message to Telegram chat

    // Persistent trigger start nodes (entry points for persistent triggers)
    TELEGRAM_BOT,       // Telegram bot trigger - receive updates from Telegram
    SLACK_SOCKET,       // Slack socket mode trigger - receive events from Slack
    DISCORD_BOT,        // Discord bot trigger - receive events from Discord
    WHATSAPP_WEBHOOK,   // WhatsApp webhook trigger - receive messages from WhatsApp
    CUSTOM_WEBSOCKET,   // Custom WebSocket trigger - receive messages via WebSocket

    // Annotation nodes (visual only, no execution)
    NOTE,           // Text annotation for documenting workflows
    FRAME,          // Visual grouping container for organizing nodes

    // Whiteboard nodes (visual only, no execution)
    WB_STICKY_NOTE,      // Sticky note element
    WB_SHAPE_RECTANGLE,  // Rectangle shape
    WB_SHAPE_CIRCLE,     // Circle shape
    WB_SHAPE_DIAMOND,    // Diamond shape
    WB_SHAPE_TRIANGLE,   // Triangle shape
    WB_SHAPE_ARROW,      // Arrow shape
    WB_SHAPE_LINE,       // Line shape
    WB_SHAPE_STAR,       // Star shape
    WB_SHAPE_HEXAGON,    // Hexagon shape
    WB_TEXT_BLOCK,       // Text block element
    WB_IMAGE,            // Image element
    WB_DRAWING,          // Freehand drawing
    WB_FRAME,            // Visual grouping frame
    WB_VOTING,           // Voting element
    WB_MERMAID,          // Mermaid diagram
    WB_ANCHOR            // Navigation anchor
}
