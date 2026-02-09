/**
 * Workflow Template Definitions
 * Each template defines a real workflow structure with nodes, edges, and description.
 * The backend create endpoint accepts nodes/edges, so we send the full definition.
 */

export interface WorkflowTemplateNode {
  tempId: string; // temporary ID for wiring edges — backend generates real UUIDs
  name: string;
  type: string;
  positionX: number;
  positionY: number;
  configuration: string; // JSON string
  ports: string; // JSON string
}

export interface WorkflowTemplateEdge {
  sourceTempId: string;
  sourcePortId: string;
  targetTempId: string;
  targetPortId: string;
  label?: string;
}

export interface WorkflowTemplateDefinition {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  nodes: WorkflowTemplateNode[];
  edges: WorkflowTemplateEdge[];
}
