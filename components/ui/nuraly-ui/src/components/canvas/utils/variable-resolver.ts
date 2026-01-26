/**
 * @license
 * Copyright 2024 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import {
  Workflow,
  WorkflowNode,
  WorkflowEdge,
  NodeTemplate,
  OutputVariable,
  NODE_TEMPLATES,
} from '../workflow-canvas.types.js';

/**
 * Get upstream nodes connected to a given node
 */
export function getUpstreamNodes(
  workflow: Workflow,
  nodeId: string
): WorkflowNode[] {
  const upstreamNodes: WorkflowNode[] = [];
  const visited = new Set<string>();

  function traverse(currentNodeId: string) {
    if (visited.has(currentNodeId)) return;
    visited.add(currentNodeId);

    // Find edges where this node is the target
    const incomingEdges = workflow.edges.filter(
      (edge) => edge.targetNodeId === currentNodeId
    );

    for (const edge of incomingEdges) {
      const sourceNode = workflow.nodes.find((n) => n.id === edge.sourceNodeId);
      if (sourceNode) {
        upstreamNodes.push(sourceNode);
        traverse(sourceNode.id);
      }
    }
  }

  traverse(nodeId);
  return upstreamNodes;
}

/**
 * Get the node template for a given node type
 */
export function getNodeTemplate(nodeType: string): NodeTemplate | undefined {
  return NODE_TEMPLATES.find((t) => t.type === nodeType);
}

/**
 * Get available variables from upstream nodes
 */
export function getAvailableVariables(
  workflow: Workflow,
  nodeId: string
): { node: WorkflowNode; variables: OutputVariable[] }[] {
  const upstreamNodes = getUpstreamNodes(workflow, nodeId);
  const result: { node: WorkflowNode; variables: OutputVariable[] }[] = [];

  for (const node of upstreamNodes) {
    const template = getNodeTemplate(node.type);
    if (template?.outputSchema) {
      result.push({
        node,
        variables: template.outputSchema,
      });
    }
  }

  return result;
}

/**
 * Flatten output variables into a simple list with full paths
 */
export function flattenVariables(
  variables: OutputVariable[],
  prefix = ''
): { path: string; description: string; type: string }[] {
  const result: { path: string; description: string; type: string }[] = [];

  for (const variable of variables) {
    result.push({
      path: variable.path,
      description: variable.description,
      type: variable.type,
    });

    if (variable.children) {
      result.push(...flattenVariables(variable.children, variable.path));
    }
  }

  return result;
}

/**
 * Get all available variable paths for a node (flattened)
 */
export function getAllAvailableVariablePaths(
  workflow: Workflow,
  nodeId: string
): { nodeName: string; path: string; description: string; type: string }[] {
  const availableVars = getAvailableVariables(workflow, nodeId);
  const result: { nodeName: string; path: string; description: string; type: string }[] = [];

  for (const { node, variables } of availableVars) {
    const flattened = flattenVariables(variables);
    for (const v of flattened) {
      result.push({
        nodeName: node.name,
        ...v,
      });
    }
  }

  return result;
}

/**
 * Extract variable paths from a JSON object recursively
 */
export function extractPathsFromJson(
  obj: any,
  prefix: string,
  maxDepth = 4,
  currentDepth = 0
): { path: string; type: string; value?: any }[] {
  const result: { path: string; type: string; value?: any }[] = [];

  if (currentDepth >= maxDepth || obj === null || obj === undefined) {
    return result;
  }

  if (Array.isArray(obj)) {
    result.push({ path: prefix, type: 'array' });
    if (obj.length > 0) {
      // Extract paths from first element as template
      const elementPaths = extractPathsFromJson(
        obj[0],
        `${prefix}[0]`,
        maxDepth,
        currentDepth + 1
      );
      result.push(...elementPaths);
    }
  } else if (typeof obj === 'object') {
    result.push({ path: prefix, type: 'object' });
    for (const [key, value] of Object.entries(obj)) {
      const childPath = `${prefix}.${key}`;
      const childType = getJsonType(value);

      if (childType === 'object' || childType === 'array') {
        result.push(...extractPathsFromJson(value, childPath, maxDepth, currentDepth + 1));
      } else {
        // For primitive types, include a sample value (truncated)
        let sampleValue = value;
        if (typeof value === 'string' && value.length > 50) {
          sampleValue = value.substring(0, 50) + '...';
        }
        result.push({ path: childPath, type: childType, value: sampleValue });
      }
    }
  } else {
    result.push({ path: prefix, type: getJsonType(obj), value: obj });
  }

  return result;
}

function getJsonType(value: any): string {
  if (value === null) return 'null';
  if (Array.isArray(value)) return 'array';
  return typeof value;
}

/**
 * Fetch latest node outputs from the API
 */
export async function fetchLatestNodeOutputs(
  workflowId: string,
  baseUrl = ''
): Promise<Map<string, any>> {
  try {
    const response = await fetch(
      `${baseUrl}/api/v1/workflows/${workflowId}/latest-node-outputs`
    );
    if (!response.ok) {
      return new Map();
    }
    const data = await response.json();
    return new Map(Object.entries(data));
  } catch (error) {
    console.warn('[VariableResolver] Failed to fetch node outputs:', error);
    return new Map();
  }
}

/**
 * Build a proper variable expression path
 */
function buildVariablePath(base: string, ...parts: string[]): string {
  let path = base;
  for (const part of parts) {
    if (part.startsWith('[')) {
      path += part;
    } else {
      path += '.' + part;
    }
  }
  return '${' + path + '}';
}

/**
 * Extract variable paths from JSON with proper expression format
 */
function extractVariablePaths(
  obj: any,
  basePath: string,
  maxDepth = 4,
  currentDepth = 0
): { path: string; type: string; value?: any }[] {
  const result: { path: string; type: string; value?: any }[] = [];

  if (currentDepth >= maxDepth || obj === null || obj === undefined) {
    return result;
  }

  if (Array.isArray(obj)) {
    result.push({ path: buildVariablePath(basePath), type: 'array' });
    if (obj.length > 0) {
      // Extract paths from first element as template
      const elementPaths = extractVariablePaths(
        obj[0],
        basePath + '[0]',
        maxDepth,
        currentDepth + 1
      );
      result.push(...elementPaths);
    }
  } else if (typeof obj === 'object') {
    // Only add object marker if not at root
    if (currentDepth > 0) {
      result.push({ path: buildVariablePath(basePath), type: 'object' });
    }
    for (const [key, value] of Object.entries(obj)) {
      const childPath = basePath + '.' + key;
      const childType = getJsonType(value);

      if (childType === 'object' || childType === 'array') {
        result.push(...extractVariablePaths(value, childPath, maxDepth, currentDepth + 1));
      } else {
        // For primitive types, include a sample value (truncated)
        let sampleValue = value;
        if (typeof value === 'string' && value.length > 50) {
          sampleValue = value.substring(0, 50) + '...';
        }
        result.push({ path: buildVariablePath(basePath, key), type: childType, value: sampleValue });
      }
    }
  } else {
    result.push({ path: buildVariablePath(basePath), type: getJsonType(obj), value: obj });
  }

  return result;
}

/**
 * Get dynamic variables from actual execution data
 */
export function getDynamicVariablesFromOutput(
  nodeId: string,
  nodeName: string,
  nodeType: string,
  nodeConfig: any,
  outputData: any
): { nodeName: string; path: string; description: string; type: string }[] {
  if (!outputData) return [];

  // Determine the base path based on node type
  let basePath: string;

  // Trigger nodes (START types) use input.xxx
  if (nodeType === 'CHAT_START' || nodeType === 'HTTP_START' || nodeType === 'START') {
    basePath = 'input';
  } else if (nodeConfig?.outputVariable) {
    // Nodes with outputVariable use variables.varName
    basePath = `variables.${nodeConfig.outputVariable}`;
  } else {
    // Default - use node name as variable
    const safeName = nodeName.toLowerCase().replace(/[^a-z0-9]/g, '_');
    basePath = `variables.${safeName}`;
  }

  const paths = extractVariablePaths(outputData, basePath, 4, 0);

  return paths.map(p => ({
    nodeName,
    path: p.path,
    description: p.value !== undefined ? `Value: ${p.value}` : `Type: ${p.type}`,
    type: p.type,
  }));
}

/**
 * Get all available variables combining static schema and dynamic execution data
 */
export async function getAllAvailableVariablesWithDynamic(
  workflow: Workflow,
  nodeId: string,
  baseUrl = ''
): Promise<{ nodeName: string; nodeId: string; path: string; description: string; type: string; isDynamic?: boolean }[]> {
  const result: { nodeName: string; nodeId: string; path: string; description: string; type: string; isDynamic?: boolean }[] = [];

  // Get static schema variables
  const staticVars = getAllAvailableVariablePaths(workflow, nodeId);
  for (const v of staticVars) {
    const node = workflow.nodes.find(n => n.name === v.nodeName);
    result.push({
      ...v,
      nodeId: node?.id || '',
      isDynamic: false,
    });
  }

  // Fetch and merge dynamic variables from last execution
  try {
    const nodeOutputs = await fetchLatestNodeOutputs(workflow.id, baseUrl);
    const upstreamNodes = getUpstreamNodes(workflow, nodeId);

    for (const node of upstreamNodes) {
      const outputData = nodeOutputs.get(node.id);
      if (outputData) {
        const dynamicVars = getDynamicVariablesFromOutput(
          node.id,
          node.name,
          node.type,
          node.configuration,
          outputData
        );

        // Add dynamic variables that don't exist in static schema
        for (const dv of dynamicVars) {
          const exists = result.some(r => r.path === dv.path && r.nodeName === dv.nodeName);
          if (!exists) {
            result.push({
              ...dv,
              nodeId: node.id,
              isDynamic: true,
            });
          }
        }
      }
    }
  } catch (error) {
    console.warn('[VariableResolver] Error fetching dynamic variables:', error);
  }

  return result;
}
