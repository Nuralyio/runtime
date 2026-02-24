/**
 * @license
 * Copyright 2024 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import { expect } from '@open-wc/testing';
import { FrameController } from '../frame.controller.js';
import {
  WorkflowNodeType,
  CanvasMode,
  NODE_ICONS,
  NODE_COLORS,
} from '../../workflow-canvas.types.js';
import type {
  Workflow,
  WorkflowNode,
  WorkflowEdge,
} from '../../workflow-canvas.types.js';

// ── Helpers ──────────────────────────────────────────────────────────

function makeNode(
  id: string,
  x: number,
  y: number,
  type: WorkflowNodeType = WorkflowNodeType.FUNCTION,
  overrides: Partial<WorkflowNode> = {},
): WorkflowNode {
  return {
    id,
    name: id,
    type,
    position: { x, y },
    configuration: {},
    ports: { inputs: [], outputs: [] },
    ...overrides,
  } as WorkflowNode;
}

function makeFrame(
  id: string,
  x: number,
  y: number,
  width: number = 400,
  height: number = 300,
  overrides: Partial<WorkflowNode> = {},
): WorkflowNode {
  return makeNode(id, x, y, WorkflowNodeType.FRAME, {
    configuration: {
      frameWidth: width,
      frameHeight: height,
      frameLabelPlacement: 'outside',
      frameCollapsed: false,
      ...((overrides.configuration as Record<string, unknown>) || {}),
    },
    containedNodeIds: [],
    ...overrides,
  });
}

function makeEdge(
  id: string,
  sourceNodeId: string,
  targetNodeId: string,
  overrides: Partial<WorkflowEdge> = {},
): WorkflowEdge {
  return {
    id,
    sourceNodeId,
    sourcePortId: 'out',
    targetNodeId,
    targetPortId: 'in',
    ...overrides,
  };
}

function makeWorkflow(
  nodes: WorkflowNode[] = [],
  edges: WorkflowEdge[] = [],
): Workflow {
  return {
    id: 'wf-1',
    name: 'Test Workflow',
    nodes,
    edges,
  };
}

interface MockHost {
  workflow: Workflow;
  selectedNodeIds: Set<string>;
  selectedEdgeIds: Set<string>;
  setWorkflowCalls: Workflow[];
  dispatchWorkflowChangedCount: number;
  requestUpdateCount: number;
  [key: string]: unknown;
}

function createMockHost(workflow: Workflow): MockHost {
  const host: MockHost = {
    // tracking
    setWorkflowCalls: [],
    dispatchWorkflowChangedCount: 0,
    requestUpdateCount: 0,

    // CanvasHost properties
    workflow,
    readonly: false,
    disabled: false,
    showMinimap: false,
    showToolbar: false,
    showPalette: false,
    currentTheme: 'light',
    viewport: { zoom: 1, panX: 0, panY: 0 },
    mode: CanvasMode.SELECT,
    selectedNodeIds: new Set<string>(),
    selectedEdgeIds: new Set<string>(),
    connectionState: null,
    dragState: null,
    contextMenu: null,
    isPanning: false,
    panStart: { x: 0, y: 0 },
    hoveredEdgeId: null,
    marqueeState: null,
    lastMousePosition: null,
    configuredNode: null,
    insertPanelNode: null,
    expandedCategories: new Set<string>(),
    canvasWrapper: null,
    canvasViewport: null,
    configPanel: null,
    insertPanel: null,
    shadowRoot: null,

    // CanvasHost methods
    setWorkflow(w: Workflow) {
      host.setWorkflowCalls.push(w);
      host.workflow = w;
    },
    dispatchWorkflowChanged() {
      host.dispatchWorkflowChangedCount++;
    },
    dispatchViewportChanged() {},
    dispatchNodeSelected() {},
    dispatchNodeMoved() {},

    // ReactiveControllerHost
    addController() {},
    removeController() {},
    requestUpdate() {
      host.requestUpdateCount++;
    },
    updateComplete: Promise.resolve(true),

    // EventTarget stubs
    addEventListener() {},
    removeEventListener() {},
    dispatchEvent() {
      return true;
    },
  };
  return host;
}

// ── Tests ────────────────────────────────────────────────────────────

suite('FrameController', () => {
  let host: MockHost;
  let ctrl: FrameController;

  setup(() => {
    host = createMockHost(makeWorkflow());
    ctrl = new FrameController(host as never);
  });

  // ──────────────────────────────────────────────────────────────────
  // 1. Containment Detection — isNodeInFrame
  // ──────────────────────────────────────────────────────────────────
  suite('isNodeInFrame()', () => {
    test('returns true when node center is inside the frame', () => {
      const frame = makeFrame('f1', 0, 0, 400, 300);
      // node at (100, 100) → center (190, 140) — well inside frame
      const node = makeNode('n1', 100, 100);
      expect(ctrl.isNodeInFrame(node, frame)).to.be.true;
    });

    test('returns false when node center is outside the frame', () => {
      const frame = makeFrame('f1', 0, 0, 400, 300);
      // node at (500, 500) → center (590, 540) — outside frame
      const node = makeNode('n1', 500, 500);
      expect(ctrl.isNodeInFrame(node, frame)).to.be.false;
    });

    test('returns true when node center is exactly on frame boundary', () => {
      const frame = makeFrame('f1', 0, 0, 400, 300);
      // center = x + 90, so x = 310 gives center = 400 (right edge)
      const node = makeNode('n1', 310, 100);
      expect(ctrl.isNodeInFrame(node, frame)).to.be.true;
    });

    test('returns false for FRAME type nodes (no nesting)', () => {
      const frame = makeFrame('f1', 0, 0, 400, 300);
      const innerFrame = makeFrame('f2', 50, 50, 100, 100);
      expect(ctrl.isNodeInFrame(innerFrame, frame)).to.be.false;
    });

    test('returns false for NOTE type nodes', () => {
      const frame = makeFrame('f1', 0, 0, 400, 300);
      const note = makeNode('note1', 100, 100, WorkflowNodeType.NOTE);
      expect(ctrl.isNodeInFrame(note, frame)).to.be.false;
    });

    test('uses default frame dimensions (400×300) when config is missing', () => {
      const frame = makeNode('f1', 0, 0, WorkflowNodeType.FRAME, {
        configuration: {},
      });
      // node at (100, 100) → center (190, 140) — inside 400×300
      const node = makeNode('n1', 100, 100);
      expect(ctrl.isNodeInFrame(node, frame)).to.be.true;
    });
  });

  // ──────────────────────────────────────────────────────────────────
  // 2. Containment Updates — updateFrameContainment
  // ──────────────────────────────────────────────────────────────────
  suite('updateFrameContainment()', () => {
    test('sets containedNodeIds on frame for nodes inside it', () => {
      const frame = makeFrame('f1', 0, 0, 400, 300);
      const n1 = makeNode('n1', 100, 100);
      const n2 = makeNode('n2', 200, 200);
      host.workflow = makeWorkflow([frame, n1, n2]);

      ctrl.updateFrameContainment(frame);

      expect(frame.containedNodeIds).to.include('n1');
      expect(frame.containedNodeIds).to.include('n2');
    });

    test('sets parentFrameId on nodes that are inside', () => {
      const frame = makeFrame('f1', 0, 0, 400, 300);
      const n1 = makeNode('n1', 100, 100);
      host.workflow = makeWorkflow([frame, n1]);

      ctrl.updateFrameContainment(frame);

      expect(n1.parentFrameId).to.equal('f1');
    });

    test('clears parentFrameId on nodes that moved out', () => {
      const frame = makeFrame('f1', 0, 0, 400, 300);
      const n1 = makeNode('n1', 500, 500, WorkflowNodeType.FUNCTION, {
        parentFrameId: 'f1',
      });
      host.workflow = makeWorkflow([frame, n1]);

      ctrl.updateFrameContainment(frame);

      expect(n1.parentFrameId).to.be.null;
      expect(frame.containedNodeIds).to.not.include('n1');
    });

    test('skips other FRAME nodes', () => {
      const frame = makeFrame('f1', 0, 0, 400, 300);
      const f2 = makeFrame('f2', 50, 50, 100, 100);
      host.workflow = makeWorkflow([frame, f2]);

      ctrl.updateFrameContainment(frame);

      expect(frame.containedNodeIds).to.not.include('f2');
    });

    test('skips the frame itself', () => {
      const frame = makeFrame('f1', 0, 0, 400, 300);
      host.workflow = makeWorkflow([frame]);

      ctrl.updateFrameContainment(frame);

      expect(frame.containedNodeIds).to.not.include('f1');
    });
  });

  // ──────────────────────────────────────────────────────────────────
  // 3. Bulk Containment — updateAllFrameContainments
  // ──────────────────────────────────────────────────────────────────
  suite('updateAllFrameContainments()', () => {
    test('updates containment for all frames in workflow', () => {
      const f1 = makeFrame('f1', 0, 0, 400, 300);
      const f2 = makeFrame('f2', 500, 0, 400, 300);
      const n1 = makeNode('n1', 100, 100);
      const n2 = makeNode('n2', 600, 100);
      host.workflow = makeWorkflow([f1, f2, n1, n2]);

      ctrl.updateAllFrameContainments();

      expect(f1.containedNodeIds).to.include('n1');
      expect(f1.containedNodeIds).to.not.include('n2');
      expect(f2.containedNodeIds).to.include('n2');
      expect(f2.containedNodeIds).to.not.include('n1');
    });

    test('calls requestUpdate() when triggerUpdate=true and changes occurred', () => {
      const f1 = makeFrame('f1', 0, 0, 400, 300);
      const n1 = makeNode('n1', 100, 100);
      host.workflow = makeWorkflow([f1, n1]);

      ctrl.updateAllFrameContainments(true);

      expect(host.requestUpdateCount).to.be.greaterThan(0);
    });

    test('does NOT call requestUpdate() when no changes', () => {
      const f1 = makeFrame('f1', 0, 0, 400, 300);
      const n1 = makeNode('n1', 100, 100);
      f1.containedNodeIds = ['n1'];
      n1.parentFrameId = 'f1';
      host.workflow = makeWorkflow([f1, n1]);

      host.requestUpdateCount = 0;
      ctrl.updateAllFrameContainments(true);

      expect(host.requestUpdateCount).to.equal(0);
    });

    test('does NOT call requestUpdate() when triggerUpdate=false', () => {
      const f1 = makeFrame('f1', 0, 0, 400, 300);
      const n1 = makeNode('n1', 100, 100);
      host.workflow = makeWorkflow([f1, n1]);

      host.requestUpdateCount = 0;
      ctrl.updateAllFrameContainments(false);

      expect(host.requestUpdateCount).to.equal(0);
    });
  });

  // ──────────────────────────────────────────────────────────────────
  // 4. Get Contained Nodes — getContainedNodes
  // ──────────────────────────────────────────────────────────────────
  suite('getContainedNodes()', () => {
    test('returns nodes matching frame containedNodeIds', () => {
      const frame = makeFrame('f1', 0, 0, 400, 300);
      frame.containedNodeIds = ['n1', 'n2'];
      const n1 = makeNode('n1', 100, 100);
      const n2 = makeNode('n2', 200, 200);
      const n3 = makeNode('n3', 300, 300);
      host.workflow = makeWorkflow([frame, n1, n2, n3]);

      const result = ctrl.getContainedNodes(frame);

      expect(result).to.have.length(2);
      expect(result.map(n => n.id)).to.include.members(['n1', 'n2']);
    });

    test('returns empty array when no containedNodeIds', () => {
      const frame = makeFrame('f1', 0, 0, 400, 300);
      frame.containedNodeIds = undefined;
      host.workflow = makeWorkflow([frame]);

      const result = ctrl.getContainedNodes(frame);

      expect(result).to.have.length(0);
    });
  });

  // ──────────────────────────────────────────────────────────────────
  // 5. Move With Contents — moveFrameWithContents
  // ──────────────────────────────────────────────────────────────────
  suite('moveFrameWithContents()', () => {
    test('moves frame position by delta', () => {
      const frame = makeFrame('f1', 100, 100, 400, 300);
      frame.containedNodeIds = [];
      host.workflow = makeWorkflow([frame]);

      ctrl.moveFrameWithContents(frame, 50, -30);

      expect(frame.position.x).to.equal(150);
      expect(frame.position.y).to.equal(70);
    });

    test('moves all contained nodes by same delta', () => {
      const frame = makeFrame('f1', 0, 0, 400, 300);
      const n1 = makeNode('n1', 100, 100);
      const n2 = makeNode('n2', 200, 200);
      frame.containedNodeIds = ['n1', 'n2'];
      host.workflow = makeWorkflow([frame, n1, n2]);

      ctrl.moveFrameWithContents(frame, 50, 50);

      expect(n1.position.x).to.equal(150);
      expect(n1.position.y).to.equal(150);
      expect(n2.position.x).to.equal(250);
      expect(n2.position.y).to.equal(250);
    });
  });

  // ──────────────────────────────────────────────────────────────────
  // 6. Collapse/Expand — toggleCollapsed
  // ──────────────────────────────────────────────────────────────────
  suite('toggleCollapsed()', () => {
    test('collapses: sets frameCollapsed true and saves expanded dimensions', () => {
      const frame = makeFrame('f1', 0, 0, 400, 300);
      frame.containedNodeIds = ['n1'];
      const n1 = makeNode('n1', 100, 100);
      host.workflow = makeWorkflow([frame, n1]);

      ctrl.toggleCollapsed(frame);

      const updated = host.setWorkflowCalls[0];
      const updatedFrame = updated.nodes.find(n => n.id === 'f1')!;
      expect(updatedFrame.configuration.frameCollapsed).to.be.true;
      expect(updatedFrame.configuration._frameExpandedWidth).to.equal(400);
      expect(updatedFrame.configuration._frameExpandedHeight).to.equal(300);
    });

    test('collapses: sets _hiddenByFrame true on contained nodes', () => {
      const frame = makeFrame('f1', 0, 0, 400, 300);
      frame.containedNodeIds = ['n1'];
      const n1 = makeNode('n1', 100, 100);
      host.workflow = makeWorkflow([frame, n1]);

      ctrl.toggleCollapsed(frame);

      const updated = host.setWorkflowCalls[0];
      const updatedN1 = updated.nodes.find(n => n.id === 'n1')!;
      expect((updatedN1.metadata as Record<string, unknown>)?._hiddenByFrame).to.be.true;
    });

    test('collapses: hides internal edges', () => {
      const frame = makeFrame('f1', 0, 0, 400, 300);
      frame.containedNodeIds = ['n1', 'n2'];
      const n1 = makeNode('n1', 100, 100);
      const n2 = makeNode('n2', 200, 100);
      const internalEdge = makeEdge('e1', 'n1', 'n2');
      host.workflow = makeWorkflow([frame, n1, n2], [internalEdge]);

      ctrl.toggleCollapsed(frame);

      const updated = host.setWorkflowCalls[0];
      const updatedEdge = updated.edges.find(e => e.id === 'e1')!;
      expect((updatedEdge as unknown as Record<string, unknown>)._hiddenByFrame).to.be.true;
    });

    test('collapses: does NOT hide external edges', () => {
      const frame = makeFrame('f1', 0, 0, 400, 300);
      frame.containedNodeIds = ['n1'];
      const n1 = makeNode('n1', 100, 100);
      const n2 = makeNode('n2', 500, 500);
      const externalEdge = makeEdge('e1', 'n1', 'n2');
      host.workflow = makeWorkflow([frame, n1, n2], [externalEdge]);

      ctrl.toggleCollapsed(frame);

      const updated = host.setWorkflowCalls[0];
      const updatedEdge = updated.edges.find(e => e.id === 'e1')!;
      // External edges are returned as-is (not spread with _hiddenByFrame)
      expect((updatedEdge as unknown as Record<string, unknown>)._hiddenByFrame).to.be.undefined;
    });

    test('expands: sets frameCollapsed false and restores dimensions', () => {
      const frame = makeFrame('f1', 0, 0, 400, 300, {
        configuration: {
          frameWidth: 400,
          frameHeight: 300,
          frameCollapsed: true,
          _frameExpandedWidth: 500,
          _frameExpandedHeight: 400,
        },
      });
      frame.containedNodeIds = ['n1'];
      const n1 = makeNode('n1', 100, 100, WorkflowNodeType.FUNCTION, {
        metadata: { _hiddenByFrame: true } as unknown as WorkflowNode['metadata'],
      });
      host.workflow = makeWorkflow([frame, n1]);

      ctrl.toggleCollapsed(frame);

      const updated = host.setWorkflowCalls[0];
      const updatedFrame = updated.nodes.find(n => n.id === 'f1')!;
      expect(updatedFrame.configuration.frameCollapsed).to.be.false;
      expect(updatedFrame.configuration.frameWidth).to.equal(500);
      expect(updatedFrame.configuration.frameHeight).to.equal(400);
    });

    test('expands: clears _hiddenByFrame on contained nodes', () => {
      const frame = makeFrame('f1', 0, 0, 400, 300, {
        configuration: {
          frameWidth: 400,
          frameHeight: 300,
          frameCollapsed: true,
          _frameExpandedWidth: 500,
          _frameExpandedHeight: 400,
        },
      });
      frame.containedNodeIds = ['n1'];
      const n1 = makeNode('n1', 100, 100, WorkflowNodeType.FUNCTION, {
        metadata: { _hiddenByFrame: true } as unknown as WorkflowNode['metadata'],
      });
      host.workflow = makeWorkflow([frame, n1]);

      ctrl.toggleCollapsed(frame);

      const updated = host.setWorkflowCalls[0];
      const updatedN1 = updated.nodes.find(n => n.id === 'n1')!;
      expect((updatedN1.metadata as Record<string, unknown>)?._hiddenByFrame).to.be.false;
    });

    test('expands: unhides internal edges', () => {
      const frame = makeFrame('f1', 0, 0, 400, 300, {
        configuration: {
          frameWidth: 400,
          frameHeight: 300,
          frameCollapsed: true,
          _frameExpandedWidth: 500,
          _frameExpandedHeight: 400,
        },
      });
      frame.containedNodeIds = ['n1', 'n2'];
      const n1 = makeNode('n1', 100, 100);
      const n2 = makeNode('n2', 200, 100);
      const internalEdge = makeEdge('e1', 'n1', 'n2');
      (internalEdge as unknown as Record<string, unknown>)._hiddenByFrame = true;
      host.workflow = makeWorkflow([frame, n1, n2], [internalEdge]);

      ctrl.toggleCollapsed(frame);

      const updated = host.setWorkflowCalls[0];
      const updatedEdge = updated.edges.find(e => e.id === 'e1')!;
      expect((updatedEdge as unknown as Record<string, unknown>)._hiddenByFrame).to.be.false;
    });

    test('calls dispatchWorkflowChanged', () => {
      const frame = makeFrame('f1', 0, 0, 400, 300);
      frame.containedNodeIds = [];
      host.workflow = makeWorkflow([frame]);

      ctrl.toggleCollapsed(frame);

      expect(host.dispatchWorkflowChangedCount).to.equal(1);
    });
  });

  // ──────────────────────────────────────────────────────────────────
  // 7. Aggregated Ports — getAggregatedPorts
  // ──────────────────────────────────────────────────────────────────
  suite('getAggregatedPorts()', () => {
    test('external→internal edge produces an input port', () => {
      const frame = makeFrame('f1', 0, 0, 400, 300);
      frame.containedNodeIds = ['n1'];
      const n1 = makeNode('n1', 100, 100);
      const n2 = makeNode('n2', 500, 100);
      const edge = makeEdge('e1', 'n2', 'n1'); // n2 (external) → n1 (internal)
      host.workflow = makeWorkflow([frame, n1, n2], [edge]);

      const { inputs, outputs } = ctrl.getAggregatedPorts(frame);

      expect(inputs).to.have.length(1);
      expect(inputs[0].direction).to.equal('incoming');
      expect(inputs[0].label).to.equal('n2');
      expect(outputs).to.have.length(0);
    });

    test('internal→external edge produces an output port', () => {
      const frame = makeFrame('f1', 0, 0, 400, 300);
      frame.containedNodeIds = ['n1'];
      const n1 = makeNode('n1', 100, 100);
      const n2 = makeNode('n2', 500, 100);
      const edge = makeEdge('e1', 'n1', 'n2'); // n1 (internal) → n2 (external)
      host.workflow = makeWorkflow([frame, n1, n2], [edge]);

      const { inputs, outputs } = ctrl.getAggregatedPorts(frame);

      expect(outputs).to.have.length(1);
      expect(outputs[0].direction).to.equal('outgoing');
      expect(outputs[0].label).to.equal('n2');
      expect(inputs).to.have.length(0);
    });

    test('internal→internal edge produces no aggregated port', () => {
      const frame = makeFrame('f1', 0, 0, 400, 300);
      frame.containedNodeIds = ['n1', 'n2'];
      const n1 = makeNode('n1', 100, 100);
      const n2 = makeNode('n2', 200, 100);
      const edge = makeEdge('e1', 'n1', 'n2');
      host.workflow = makeWorkflow([frame, n1, n2], [edge]);

      const { inputs, outputs } = ctrl.getAggregatedPorts(frame);

      expect(inputs).to.have.length(0);
      expect(outputs).to.have.length(0);
    });

    test('external→external edge produces no aggregated port', () => {
      const frame = makeFrame('f1', 0, 0, 400, 300);
      frame.containedNodeIds = [];
      const n1 = makeNode('n1', 500, 100);
      const n2 = makeNode('n2', 600, 100);
      const edge = makeEdge('e1', 'n1', 'n2');
      host.workflow = makeWorkflow([frame, n1, n2], [edge]);

      const { inputs, outputs } = ctrl.getAggregatedPorts(frame);

      expect(inputs).to.have.length(0);
      expect(outputs).to.have.length(0);
    });

    test('uses source/target node names as labels', () => {
      const frame = makeFrame('f1', 0, 0, 400, 300);
      frame.containedNodeIds = ['n1'];
      const n1 = makeNode('n1', 100, 100, WorkflowNodeType.FUNCTION, {
        name: 'MyFunc',
      } as Partial<WorkflowNode>);
      const n2 = makeNode('n2', 500, 100, WorkflowNodeType.HTTP, {
        name: 'API Call',
      } as Partial<WorkflowNode>);
      const edgeIn = makeEdge('e1', 'n2', 'n1');
      const edgeOut = makeEdge('e2', 'n1', 'n2');
      host.workflow = makeWorkflow([frame, n1, n2], [edgeIn, edgeOut]);

      const { inputs, outputs } = ctrl.getAggregatedPorts(frame);

      expect(inputs[0].label).to.equal('API Call');
      expect(outputs[0].label).to.equal('API Call');
    });
  });

  // ──────────────────────────────────────────────────────────────────
  // 8. Fit To Contents — fitToContents
  // ──────────────────────────────────────────────────────────────────
  suite('fitToContents()', () => {
    test('repositions frame to enclose contained nodes with padding', () => {
      const frame = makeFrame('f1', 0, 0, 400, 300);
      frame.containedNodeIds = ['n1'];
      const n1 = makeNode('n1', 200, 200);
      host.workflow = makeWorkflow([frame, n1]);

      ctrl.fitToContents(frame, 40);

      // x = 200 - 40 = 160
      // y = 200 - 40 - 24 (outside label) = 136
      expect(frame.position.x).to.equal(160);
      expect(frame.position.y).to.equal(136);
    });

    test('updates frame dimensions', () => {
      const frame = makeFrame('f1', 0, 0, 400, 300);
      frame.containedNodeIds = ['n1', 'n2'];
      const n1 = makeNode('n1', 100, 100);
      const n2 = makeNode('n2', 300, 200);
      host.workflow = makeWorkflow([frame, n1, n2]);

      ctrl.fitToContents(frame, 40);

      // minX=100, maxX=300+180=480 → width = 480 - 100 + 80 = 460
      // minY=100, maxY=200+80=280 → height = 280 - 100 + 80 + 24 = 284
      expect(frame.configuration.frameWidth).to.equal(460);
      expect(frame.configuration.frameHeight).to.equal(284);
    });

    test('accounts for outside label placement (+24px)', () => {
      const frame = makeFrame('f1', 0, 0, 400, 300);
      frame.containedNodeIds = ['n1'];
      const n1 = makeNode('n1', 100, 100);
      host.workflow = makeWorkflow([frame, n1]);

      ctrl.fitToContents(frame, 40);

      // y = 100 - 40 - 24 = 36
      expect(frame.position.y).to.equal(36);
      // height = (100+80) - 100 + 80 + 24 = 184
      expect(frame.configuration.frameHeight).to.equal(184);
    });

    test('no-op when frame has no contained nodes', () => {
      const frame = makeFrame('f1', 100, 100, 400, 300);
      frame.containedNodeIds = [];
      host.workflow = makeWorkflow([frame]);

      ctrl.fitToContents(frame);

      expect(frame.position.x).to.equal(100);
      expect(frame.position.y).to.equal(100);
      expect(host.requestUpdateCount).to.equal(0);
    });

    test('calls requestUpdate() and dispatchWorkflowChanged()', () => {
      const frame = makeFrame('f1', 0, 0, 400, 300);
      frame.containedNodeIds = ['n1'];
      const n1 = makeNode('n1', 100, 100);
      host.workflow = makeWorkflow([frame, n1]);

      ctrl.fitToContents(frame);

      expect(host.requestUpdateCount).to.be.greaterThan(0);
      expect(host.dispatchWorkflowChangedCount).to.equal(1);
    });
  });

  // ──────────────────────────────────────────────────────────────────
  // 9. Create Frame From Selection — createFrameFromSelection
  // ──────────────────────────────────────────────────────────────────
  suite('createFrameFromSelection()', () => {
    test('creates frame with correct bounds around selected nodes', () => {
      const n1 = makeNode('n1', 100, 100);
      const n2 = makeNode('n2', 300, 200);
      host.workflow = makeWorkflow([n1, n2]);
      host.selectedNodeIds = new Set(['n1', 'n2']);

      const frame = ctrl.createFrameFromSelection();

      expect(frame).to.not.be.null;
      expect(frame!.type).to.equal(WorkflowNodeType.FRAME);
      // x = 100 - 40 = 60
      // y = 100 - 40 - 24 = 36
      expect(frame!.position.x).to.equal(60);
      expect(frame!.position.y).to.equal(36);
    });

    test('calls setWorkflow with new frame prepended to nodes', () => {
      const n1 = makeNode('n1', 100, 100);
      host.workflow = makeWorkflow([n1]);
      host.selectedNodeIds = new Set(['n1']);

      ctrl.createFrameFromSelection();

      expect(host.setWorkflowCalls).to.have.length(1);
      const updatedNodes = host.setWorkflowCalls[0].nodes;
      expect(updatedNodes[0].type).to.equal(WorkflowNodeType.FRAME);
    });

    test('sets parentFrameId on selected nodes immutably via setWorkflow', () => {
      const n1 = makeNode('n1', 100, 100);
      host.workflow = makeWorkflow([n1]);
      host.selectedNodeIds = new Set(['n1']);

      const frame = ctrl.createFrameFromSelection()!;

      const updatedN1 = host.setWorkflowCalls[0].nodes.find(n => n.id === 'n1')!;
      expect(updatedN1.parentFrameId).to.equal(frame.id);
      // Original node should not have been mutated
      expect(n1.parentFrameId).to.be.undefined;
    });

    test('frame containedNodeIds matches selected node ids', () => {
      const n1 = makeNode('n1', 100, 100);
      const n2 = makeNode('n2', 200, 200);
      host.workflow = makeWorkflow([n1, n2]);
      host.selectedNodeIds = new Set(['n1', 'n2']);

      const frame = ctrl.createFrameFromSelection()!;

      expect(frame.containedNodeIds).to.include.members(['n1', 'n2']);
    });

    test('excludes FRAME and NOTE types from selection', () => {
      const n1 = makeNode('n1', 100, 100);
      const existingFrame = makeFrame('f2', 50, 50, 100, 100);
      const note = makeNode('note1', 200, 200, WorkflowNodeType.NOTE);
      host.workflow = makeWorkflow([n1, existingFrame, note]);
      host.selectedNodeIds = new Set(['n1', 'f2', 'note1']);

      const frame = ctrl.createFrameFromSelection()!;

      expect(frame.containedNodeIds).to.include('n1');
      expect(frame.containedNodeIds).to.not.include('f2');
      expect(frame.containedNodeIds).to.not.include('note1');
    });

    test('returns null when no valid nodes selected (setWorkflow NOT called)', () => {
      const existingFrame = makeFrame('f1', 0, 0, 100, 100);
      host.workflow = makeWorkflow([existingFrame]);
      host.selectedNodeIds = new Set(['f1']);

      const result = ctrl.createFrameFromSelection();

      expect(result).to.be.null;
      expect(host.setWorkflowCalls).to.have.length(0);
    });

    test('returns null when selection is empty', () => {
      host.workflow = makeWorkflow([]);
      host.selectedNodeIds = new Set();

      const result = ctrl.createFrameFromSelection();

      expect(result).to.be.null;
      expect(host.setWorkflowCalls).to.have.length(0);
    });

    test('calls dispatchWorkflowChanged', () => {
      const n1 = makeNode('n1', 100, 100);
      host.workflow = makeWorkflow([n1]);
      host.selectedNodeIds = new Set(['n1']);

      ctrl.createFrameFromSelection();

      expect(host.dispatchWorkflowChangedCount).to.equal(1);
    });
  });

  // ──────────────────────────────────────────────────────────────────
  // 10. Delete Frame — deleteFrame
  // ──────────────────────────────────────────────────────────────────
  suite('deleteFrame()', () => {
    test('ungroup (deleteContents=false): removes only the frame', () => {
      const frame = makeFrame('f1', 0, 0, 400, 300);
      frame.containedNodeIds = ['n1'];
      const n1 = makeNode('n1', 100, 100, WorkflowNodeType.FUNCTION, {
        parentFrameId: 'f1',
      });
      host.workflow = makeWorkflow([frame, n1]);

      ctrl.deleteFrame(frame, false);

      const updated = host.setWorkflowCalls[0];
      expect(updated.nodes.find(n => n.id === 'f1')).to.be.undefined;
      expect(updated.nodes.find(n => n.id === 'n1')).to.not.be.undefined;
    });

    test('ungroup: clears parentFrameId on contained nodes', () => {
      const frame = makeFrame('f1', 0, 0, 400, 300);
      frame.containedNodeIds = ['n1'];
      const n1 = makeNode('n1', 100, 100, WorkflowNodeType.FUNCTION, {
        parentFrameId: 'f1',
      });
      host.workflow = makeWorkflow([frame, n1]);

      ctrl.deleteFrame(frame, false);

      const updated = host.setWorkflowCalls[0];
      const updatedN1 = updated.nodes.find(n => n.id === 'n1')!;
      expect(updatedN1.parentFrameId).to.be.null;
    });

    test('ungroup: other nodes are untouched', () => {
      const frame = makeFrame('f1', 0, 0, 400, 300);
      frame.containedNodeIds = ['n1'];
      const n1 = makeNode('n1', 100, 100, WorkflowNodeType.FUNCTION, {
        parentFrameId: 'f1',
      });
      const n2 = makeNode('n2', 500, 500);
      host.workflow = makeWorkflow([frame, n1, n2]);

      ctrl.deleteFrame(frame, false);

      const updated = host.setWorkflowCalls[0];
      const updatedN2 = updated.nodes.find(n => n.id === 'n2')!;
      expect(updatedN2.parentFrameId).to.be.undefined;
    });

    test('deleteContents=true: removes frame + contained nodes + their edges', () => {
      const frame = makeFrame('f1', 0, 0, 400, 300);
      frame.containedNodeIds = ['n1', 'n2'];
      const n1 = makeNode('n1', 100, 100);
      const n2 = makeNode('n2', 200, 100);
      const n3 = makeNode('n3', 500, 500);
      const e1 = makeEdge('e1', 'n1', 'n2');
      const e2 = makeEdge('e2', 'n1', 'n3');
      const e3 = makeEdge('e3', 'n3', 'n3');
      host.workflow = makeWorkflow([frame, n1, n2, n3], [e1, e2, e3]);

      ctrl.deleteFrame(frame, true);

      const updated = host.setWorkflowCalls[0];
      expect(updated.nodes.find(n => n.id === 'f1')).to.be.undefined;
      expect(updated.nodes.find(n => n.id === 'n1')).to.be.undefined;
      expect(updated.nodes.find(n => n.id === 'n2')).to.be.undefined;
      expect(updated.nodes.find(n => n.id === 'n3')).to.not.be.undefined;
      // e1 (n1→n2, both contained) and e2 (n1→n3, n1 contained) removed
      expect(updated.edges.find(e => e.id === 'e1')).to.be.undefined;
      expect(updated.edges.find(e => e.id === 'e2')).to.be.undefined;
      expect(updated.edges.find(e => e.id === 'e3')).to.not.be.undefined;
    });

    test('calls dispatchWorkflowChanged in both cases', () => {
      const frame = makeFrame('f1', 0, 0, 400, 300);
      frame.containedNodeIds = [];
      host.workflow = makeWorkflow([frame]);

      ctrl.deleteFrame(frame, false);
      expect(host.dispatchWorkflowChangedCount).to.equal(1);

      // Reset and test with deleteContents=true
      const frame2 = makeFrame('f2', 0, 0, 400, 300);
      frame2.containedNodeIds = [];
      host.workflow = makeWorkflow([frame2]);
      host.dispatchWorkflowChangedCount = 0;

      ctrl.deleteFrame(frame2, true);
      expect(host.dispatchWorkflowChangedCount).to.equal(1);
    });
  });

  // ──────────────────────────────────────────────────────────────────
  // 11. Helpers
  // ──────────────────────────────────────────────────────────────────
  suite('Helpers', () => {
    suite('isFrameCollapsed()', () => {
      test('returns true when frameCollapsed is true', () => {
        const frame = makeFrame('f1', 0, 0, 400, 300, {
          configuration: { frameCollapsed: true, frameWidth: 400, frameHeight: 300 },
        });
        expect(ctrl.isFrameCollapsed(frame)).to.be.true;
      });

      test('returns false when frameCollapsed is false', () => {
        const frame = makeFrame('f1', 0, 0, 400, 300);
        expect(ctrl.isFrameCollapsed(frame)).to.be.false;
      });

      test('returns false when configuration is missing', () => {
        const frame = makeNode('f1', 0, 0, WorkflowNodeType.FRAME, {
          configuration: undefined as unknown as Record<string, unknown>,
        });
        expect(ctrl.isFrameCollapsed(frame)).to.be.false;
      });
    });

    suite('getContainedNodePreviews()', () => {
      test('returns icon/color/name for contained nodes', () => {
        const frame = makeFrame('f1', 0, 0, 400, 300);
        frame.containedNodeIds = ['n1'];
        const n1 = makeNode('n1', 100, 100, WorkflowNodeType.FUNCTION, {
          name: 'MyFunc',
          metadata: { icon: 'custom-icon', color: '#ff0000' },
        } as Partial<WorkflowNode>);
        host.workflow = makeWorkflow([frame, n1]);

        const previews = ctrl.getContainedNodePreviews(frame);

        expect(previews).to.have.length(1);
        expect(previews[0].icon).to.equal('custom-icon');
        expect(previews[0].color).to.equal('#ff0000');
        expect(previews[0].name).to.equal('MyFunc');
      });

      test('respects maxCount', () => {
        const frame = makeFrame('f1', 0, 0, 400, 300);
        const ids: string[] = [];
        const nodes: WorkflowNode[] = [frame];
        for (let i = 0; i < 10; i++) {
          const id = `n${i}`;
          ids.push(id);
          nodes.push(makeNode(id, 100 + i * 10, 100));
        }
        frame.containedNodeIds = ids;
        host.workflow = makeWorkflow(nodes);

        const previews = ctrl.getContainedNodePreviews(frame, 3);
        expect(previews).to.have.length(3);
      });

      test('uses defaults from NODE_ICONS/NODE_COLORS when metadata missing', () => {
        const frame = makeFrame('f1', 0, 0, 400, 300);
        frame.containedNodeIds = ['n1'];
        const n1 = makeNode('n1', 100, 100, WorkflowNodeType.HTTP, {
          name: 'Http Call',
        } as Partial<WorkflowNode>);
        host.workflow = makeWorkflow([frame, n1]);

        const previews = ctrl.getContainedNodePreviews(frame);

        expect(previews[0].icon).to.equal(NODE_ICONS[WorkflowNodeType.HTTP]);
        expect(previews[0].color).to.equal(NODE_COLORS[WorkflowNodeType.HTTP]);
      });
    });
  });

  // ──────────────────────────────────────────────────────────────────
  // 12. Resize Operations — startResize / stopResize
  // ──────────────────────────────────────────────────────────────────
  suite('Resize Operations', () => {
    suite('startResize()', () => {
      test('sets resize state and registers document listeners', () => {
        const frame = makeFrame('f1', 0, 0, 400, 300);
        host.workflow = makeWorkflow([frame]);

        const addSpy: Array<{ type: string }> = [];
        const origAdd = document.addEventListener.bind(document);
        document.addEventListener = function (type: string, ...args: unknown[]) {
          addSpy.push({ type });
          return origAdd(type, ...args as [EventListenerOrEventListenerObject, boolean | AddEventListenerOptions | undefined]);
        } as typeof document.addEventListener;

        try {
          const event = new MouseEvent('mousedown', { clientX: 50, clientY: 50 });
          ctrl.startResize(event, frame, 'se');

          const types = addSpy.map(s => s.type);
          expect(types).to.include('mousemove');
          expect(types).to.include('mouseup');
        } finally {
          document.addEventListener = origAdd;
        }
      });
    });

    suite('stopResize()', () => {
      test('clears resize state and dispatches workflow changed', () => {
        const frame = makeFrame('f1', 0, 0, 400, 300);
        host.workflow = makeWorkflow([frame]);

        const event = new MouseEvent('mousedown', { clientX: 50, clientY: 50 });
        ctrl.startResize(event, frame, 'se');

        ctrl.stopResize();

        expect(host.dispatchWorkflowChangedCount).to.equal(1);
      });

      test('updates containment after resize', () => {
        const frame = makeFrame('f1', 0, 0, 400, 300);
        const n1 = makeNode('n1', 100, 100);
        host.workflow = makeWorkflow([frame, n1]);

        const event = new MouseEvent('mousedown', { clientX: 50, clientY: 50 });
        ctrl.startResize(event, frame, 'se');

        ctrl.stopResize();

        expect(frame.containedNodeIds).to.include('n1');
      });

      test('no-op when no active resize state', () => {
        host.dispatchWorkflowChangedCount = 0;

        ctrl.stopResize();

        expect(host.dispatchWorkflowChangedCount).to.equal(0);
      });
    });
  });
});
