/**
 * @license
 * Copyright 2024 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import { svg, nothing, SVGTemplateResult } from 'lit';
import {
  WorkflowEdge,
  WorkflowNode,
  Position,
  ExecutionStatus,
  WorkflowNodeType,
} from '../workflow-canvas.types.js';
import type { ConnectionState } from '../interfaces/index.js';

/**
 * Check if a node is inside a collapsed frame
 */
function isNodeInCollapsedFrame(node: WorkflowNode, nodes: WorkflowNode[]): WorkflowNode | null {
  if (!node.parentFrameId) return null;

  const parentFrame = nodes.find(n => n.id === node.parentFrameId);
  if (!parentFrame) return null;

  const isCollapsed = parentFrame.configuration?.frameCollapsed as boolean;
  return isCollapsed ? parentFrame : null;
}

/**
 * Get position for a port on a collapsed frame
 * Ports are vertically centered on the left/right edges of the frame
 */
function getCollapsedFramePortPosition(
  frame: WorkflowNode,
  isInput: boolean,
  portIndex: number = 0,
  totalPorts: number = 1
): Position {
  const frameWidth = 180; // Collapsed frame min-width from CSS
  // Collapsed frame height: header (~44px) + icons preview (~48px) = ~92px
  const frameHeight = 92;
  const portSpacing = 16; // gap: 8px + port height 10px

  // Calculate vertical center position
  const totalPortsHeight = (totalPorts - 1) * portSpacing;
  const centerY = frame.position.y + frameHeight / 2;
  const offsetY = (portIndex - (totalPorts - 1) / 2) * portSpacing;

  if (isInput) {
    // Input ports on left side - port sticks out 5px (margin-left: -5px)
    return {
      x: frame.position.x,
      y: centerY + offsetY,
    };
  } else {
    // Output ports on right side - port sticks out 5px (margin-right: -5px)
    return {
      x: frame.position.x + frameWidth,
      y: centerY + offsetY,
    };
  }
}

/**
 * Callbacks for edge interactions
 */
export interface EdgeCallbacks {
  onEdgeClick: (e: MouseEvent, edge: WorkflowEdge) => void;
  onEdgeHover: (edgeId: string | null) => void;
  getPortPosition: (node: WorkflowNode, portId: string, isInput: boolean) => Position;
}

/**
 * Data required for rendering edges
 */
export interface EdgesTemplateData {
  edges: WorkflowEdge[];
  nodes: WorkflowNode[];
  selectedEdgeIds: Set<string>;
  hoveredEdgeId: string | null;
  connectionState: ConnectionState | null;
  currentTheme?: string;
  callbacks: EdgeCallbacks;
}

/**
 * Derive edge execution status from connected nodes
 * Edge is colored only if data actually flowed through it (both source completed AND target was executed)
 */
function deriveEdgeStatus(
  edge: WorkflowEdge,
  sourceNode: WorkflowNode | undefined,
  targetNode: WorkflowNode | undefined
): ExecutionStatus | undefined {
  // If edge has explicit status, use it
  if (edge.status) {
    return edge.status;
  }

  const sourceStatus = sourceNode?.status;
  const targetStatus = targetNode?.status;

  // No status if source hasn't started
  if (!sourceStatus || sourceStatus === ExecutionStatus.IDLE) {
    return undefined;
  }

  // For completed/failed source, only color edge if target was actually executed
  // This ensures only the taken path is colored (important for condition branches)
  if (sourceStatus === ExecutionStatus.COMPLETED || sourceStatus === ExecutionStatus.FAILED) {
    // Target must have been executed (not IDLE or PENDING) for the edge to be colored
    if (!targetStatus || targetStatus === ExecutionStatus.IDLE || targetStatus === ExecutionStatus.PENDING) {
      return undefined;
    }
    // If source failed, the entire path after it is the failure path (red)
    if (sourceStatus === ExecutionStatus.FAILED) {
      return ExecutionStatus.FAILED;
    }
    // If target failed, show failure
    if (targetStatus === ExecutionStatus.FAILED) {
      return ExecutionStatus.FAILED;
    }
    return ExecutionStatus.COMPLETED;
  }

  // If source is running, edge shows data is about to flow (only if target is pending/running)
  if (sourceStatus === ExecutionStatus.RUNNING) {
    if (targetStatus === ExecutionStatus.PENDING || targetStatus === ExecutionStatus.RUNNING) {
      return ExecutionStatus.RUNNING;
    }
    return undefined;
  }

  // If source is pending/waiting, don't color edges yet
  return undefined;
}

/**
 * Get edge color based on selection, hover, and execution status
 */
function getEdgeColor(
  isSelected: boolean,
  isHovered: boolean,
  status: ExecutionStatus | undefined,
  currentTheme?: string
): string {
  const isLight = currentTheme?.includes('light') || currentTheme === 'default';

  // Execution status colors take priority
  if (status === ExecutionStatus.COMPLETED) {
    return '#22c55e'; // Green for completed
  }
  if (status === ExecutionStatus.RUNNING) {
    return '#3b82f6'; // Blue for running
  }
  if (status === ExecutionStatus.FAILED) {
    return '#ef4444'; // Red for failed
  }
  if (status === ExecutionStatus.PENDING) {
    return '#f59e0b'; // Orange for pending
  }

  if (isSelected) {
    return '#3b82f6'; // Blue for selected
  }
  if (isHovered) {
    return '#60a5fa'; // Light blue for hover
  }
  return isLight ? '#9ca3af' : '#6b7280';
}

/**
 * Render a single edge with bezier curve
 */
export function renderEdgeTemplate(
  edge: WorkflowEdge,
  nodes: WorkflowNode[],
  selectedEdgeIds: Set<string>,
  hoveredEdgeId: string | null,
  currentTheme: string | undefined,
  callbacks: EdgeCallbacks
): SVGTemplateResult | typeof nothing {
  // Check if edge is hidden by a collapsed frame (both ends inside same frame)
  if ((edge as unknown as Record<string, unknown>)._hiddenByFrame) {
    return nothing;
  }

  const sourceNode = nodes.find(n => n.id === edge.sourceNodeId);
  const targetNode = nodes.find(n => n.id === edge.targetNodeId);

  if (!sourceNode || !targetNode) return nothing;

  // Check if source or target is inside a collapsed frame
  const sourceCollapsedFrame = isNodeInCollapsedFrame(sourceNode, nodes);
  const targetCollapsedFrame = isNodeInCollapsedFrame(targetNode, nodes);

  // If both are in the same collapsed frame, don't render (internal edge)
  if (sourceCollapsedFrame && targetCollapsedFrame && sourceCollapsedFrame.id === targetCollapsedFrame.id) {
    return nothing;
  }

  // Calculate start position - redirect to frame if source is in collapsed frame
  let start: Position;
  if (sourceCollapsedFrame) {
    // For collapsed frame, position ports vertically centered
    // Use a fixed position since we render one aggregated port per crossing edge
    start = getCollapsedFramePortPosition(sourceCollapsedFrame, false, 0, 1);
  } else {
    start = callbacks.getPortPosition(sourceNode, edge.sourcePortId, false);
  }

  // Calculate end position - redirect to frame if target is in collapsed frame
  let end: Position;
  if (targetCollapsedFrame) {
    // For collapsed frame, position ports vertically centered
    end = getCollapsedFramePortPosition(targetCollapsedFrame, true, 0, 1);
  } else {
    end = callbacks.getPortPosition(targetNode, edge.targetPortId, true);
  }

  // Calculate bezier curve control points
  const dx = end.x - start.x;
  const controlOffset = Math.min(Math.abs(dx) * 0.5, 100);

  const path = `M ${start.x} ${start.y} C ${start.x + controlOffset} ${start.y}, ${end.x - controlOffset} ${end.y}, ${end.x} ${end.y}`;

  const isSelected = selectedEdgeIds.has(edge.id);
  const isHovered = hoveredEdgeId === edge.id;
  // Derive edge status from connected nodes if not explicitly set
  const edgeStatus = deriveEdgeStatus(edge, sourceNode, targetNode);
  const strokeColor = getEdgeColor(isSelected, isHovered, edgeStatus, currentTheme);
  const strokeWidth = isSelected || isHovered || edgeStatus ? 3 : 2;

  // Calculate arrow position at middle of the curve
  const arrowLength = 12;
  const arrowWidth = 8;

  // Position arrow at t=0.5 (middle of curve)
  const tArrow = 0.5;
  const arrowX = Math.pow(1-tArrow, 3) * start.x + 3 * Math.pow(1-tArrow, 2) * tArrow * (start.x + controlOffset) + 3 * (1-tArrow) * Math.pow(tArrow, 2) * (end.x - controlOffset) + Math.pow(tArrow, 3) * end.x;
  const arrowY = Math.pow(1-tArrow, 3) * start.y + 3 * Math.pow(1-tArrow, 2) * tArrow * start.y + 3 * (1-tArrow) * Math.pow(tArrow, 2) * end.y + Math.pow(tArrow, 3) * end.y;

  // Calculate tangent direction at arrow position for proper rotation
  const tTangent = tArrow + 0.05;
  const tangentX = Math.pow(1-tTangent, 3) * start.x + 3 * Math.pow(1-tTangent, 2) * tTangent * (start.x + controlOffset) + 3 * (1-tTangent) * Math.pow(tTangent, 2) * (end.x - controlOffset) + Math.pow(tTangent, 3) * end.x;
  const tangentY = Math.pow(1-tTangent, 3) * start.y + 3 * Math.pow(1-tTangent, 2) * tTangent * start.y + 3 * (1-tTangent) * Math.pow(tTangent, 2) * end.y + Math.pow(tTangent, 3) * end.y;

  // Calculate angle from current position toward next point on curve
  const angle = Math.atan2(tangentY - arrowY, tangentX - arrowX) * 180 / Math.PI;

  return svg`
    <g class="edge-group" data-edge-id=${edge.id}>
      <!-- Invisible wider path for easier clicking -->
      <path
        d=${path}
        stroke="transparent"
        stroke-width="14"
        fill="none"
        style="cursor: pointer; pointer-events: stroke;"
        @click=${(e: MouseEvent) => callbacks.onEdgeClick(e, edge)}
        @mouseenter=${() => callbacks.onEdgeHover(edge.id)}
        @mouseleave=${() => callbacks.onEdgeHover(null)}
      />
      <!-- Visible edge path -->
      <path
        class="edge-path"
        d=${path}
        fill="none"
        style="pointer-events: none; stroke: ${strokeColor}; stroke-width: ${strokeWidth}px; transition: stroke 0.15s ease, stroke-width 0.15s ease;"
      />
      <polygon
        class="edge-arrow"
        points="${arrowX + arrowLength/2},${arrowY} ${arrowX - arrowLength/2},${arrowY - arrowWidth/2} ${arrowX - arrowLength/2},${arrowY + arrowWidth/2}"
        transform="rotate(${angle}, ${arrowX}, ${arrowY})"
        style="pointer-events: none; fill: ${strokeColor}; transition: fill 0.15s ease;"
      />
      ${edge.label ? svg`
        <text
          class="edge-label"
          x=${(start.x + end.x) / 2}
          y=${(start.y + end.y) / 2 - 8}
          text-anchor="middle"
          fill="#666"
        >${edge.label}</text>
      ` : nothing}
    </g>
  `;
}

/**
 * Render the in-progress connection line
 */
export function renderConnectionLineTemplate(
  connectionState: ConnectionState | null,
  nodes: WorkflowNode[],
  getPortPosition: (node: WorkflowNode, portId: string, isInput: boolean) => Position
): SVGTemplateResult | typeof nothing {
  if (!connectionState) return nothing;

  const sourceNode = nodes.find(n => n.id === connectionState.sourceNodeId);
  if (!sourceNode) return nothing;

  const start = getPortPosition(
    sourceNode,
    connectionState.sourcePortId,
    connectionState.sourceIsInput
  );

  const end = { x: connectionState.mouseX, y: connectionState.mouseY };

  const dx = end.x - start.x;
  const controlOffset = Math.min(Math.abs(dx) * 0.5, 100);

  const path = connectionState.sourceIsInput
    ? `M ${end.x} ${end.y} C ${end.x + controlOffset} ${end.y}, ${start.x - controlOffset} ${start.y}, ${start.x} ${start.y}`
    : `M ${start.x} ${start.y} C ${start.x + controlOffset} ${start.y}, ${end.x - controlOffset} ${end.y}, ${end.x} ${end.y}`;

  return svg`<path class="connection-line" d=${path} stroke="#3b82f6" stroke-width="2" stroke-dasharray="5" fill="none" />`;
}

/**
 * Render all edges and connection line
 */
export function renderEdgesTemplate(data: EdgesTemplateData): SVGTemplateResult {
  const { edges, nodes, selectedEdgeIds, hoveredEdgeId, connectionState, currentTheme, callbacks } = data;

  return svg`
    ${edges.map(edge => renderEdgeTemplate(edge, nodes, selectedEdgeIds, hoveredEdgeId, currentTheme, callbacks))}
    ${renderConnectionLineTemplate(connectionState, nodes, callbacks.getPortPosition)}
  `;
}
