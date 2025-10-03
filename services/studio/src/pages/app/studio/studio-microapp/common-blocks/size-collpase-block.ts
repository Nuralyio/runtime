/**
 * SIZE COLLAPSE BLOCK - JSON-DRIVEN APPROACH
 * 
 * This file now uses the new JSON-driven approach instead of the complex factory system.
 * The configuration is in size-config.json and processed by json-processor.ts
 */

// Force reload: 2025-10-03-15:35:00
// Import the JSON-generated components
import generatedSizeComponents from "../config/json-processor.ts";

export default generatedSizeComponents;