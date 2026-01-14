package com.nuraly.workflows.entity.enums;

public enum NodeType {
    START,          // Entry point
    END,            // Exit point
    HTTP_START,     // HTTP trigger - start workflow from HTTP request
    HTTP_END,       // HTTP response - return response to HTTP caller
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
    LLM             // LLM node - call AI providers (OpenAI, Anthropic, Gemini) with tool calling
}
