/**
 * Whiteboard Template Definitions
 * Each template defines a whiteboard layout with nodes (sticky notes, frames, shapes) and edges.
 */

export interface WhiteboardNode {
  id: string;
  name: string;
  type: string;
  position: { x: number; y: number };
  configuration: Record<string, unknown>;
}

export interface WhiteboardEdge {
  id: string;
  sourceNodeId: string;
  sourcePortId: string;
  targetNodeId: string;
  targetPortId: string;
}

export interface WhiteboardTemplate {
  id: string;
  name: string;
  category: string;
  nodes: WhiteboardNode[];
  edges: WhiteboardEdge[];
}

// ─── Helpers: build nodes/edges without repeating property names ──

function node(
  id: string, type: string, x: number, y: number,
  config: Record<string, unknown>, name = '',
): WhiteboardNode {
  return { id, name, type, position: { x, y }, configuration: config };
}

// Type-specific builders (encapsulate repeated property names)
const sticky = (id: string, x: number, y: number, text: string, bg: string, w: number, h: number) =>
  node(id, 'WB_STICKY_NOTE', x, y, { textContent: text, backgroundColor: bg, width: w, height: h });

const frame = (id: string, x: number, y: number, text: string, fw: number, fh: number) =>
  node(id, 'WB_FRAME', x, y, { textContent: text, frameWidth: fw, frameHeight: fh }, text);

const circle = (id: string, x: number, y: number, text: string, bg: string, sz: number) =>
  node(id, 'WB_SHAPE_CIRCLE', x, y, { textContent: text, backgroundColor: bg, textColor: '#ffffff', width: sz, height: sz });

const rect = (id: string, x: number, y: number, text: string, bg: string, w: number, h: number) =>
  node(id, 'WB_SHAPE_RECTANGLE', x, y, { textContent: text, backgroundColor: bg, textColor: '#ffffff', width: w, height: h });

const edge = (id: string, src: string, tgt: string): WhiteboardEdge =>
  ({ id, sourceNodeId: src, sourcePortId: 'out', targetNodeId: tgt, targetPortId: 'in' });

// ─── Templates ──────────────────────────────────────────────

export const WHITEBOARD_TEMPLATES: WhiteboardTemplate[] = [
  {
    id: 'brainstorm-board', name: 'Brainstorm Board', category: 'Ideation',
    nodes: [
      sticky('n1', 80, 40, 'User Research', '#fef08a', 160, 140),
      sticky('n2', 300, 30, 'AI Features', '#bbf7d0', 160, 140),
      sticky('n3', 520, 50, 'Onboarding', '#bfdbfe', 160, 140),
      sticky('n4', 140, 230, 'Pricing', '#fecaca', 160, 140),
      sticky('n5', 380, 240, 'Marketing', '#e9d5ff', 160, 140),
    ],
    edges: [],
  },
  {
    id: 'sprint-retro', name: 'Sprint Retrospective', category: 'Agile',
    nodes: [
      frame('f1', 20, 20, 'Went Well', 220, 360),
      frame('f2', 270, 20, 'Improve', 220, 360),
      frame('f3', 520, 20, 'Actions', 220, 360),
      sticky('s1', 40, 70, 'Teamwork', '#bbf7d0', 180, 100),
      sticky('s2', 40, 190, 'Velocity up', '#bbf7d0', 180, 100),
      sticky('s3', 290, 70, 'Slow testing', '#fecaca', 180, 100),
      sticky('s4', 290, 190, 'Missing docs', '#fecaca', 180, 100),
      sticky('s5', 540, 70, 'Add CI/CD', '#bfdbfe', 180, 100),
      sticky('s6', 540, 190, 'Code review', '#bfdbfe', 180, 100),
    ],
    edges: [],
  },
  {
    id: 'mind-map', name: 'Mind Map', category: 'Planning',
    nodes: [
      circle('c0', 280, 160, 'Main Topic', '#3b82f6', 120),
      circle('c1', 80, 40, 'Topic A', '#8b5cf6', 90),
      circle('c2', 500, 40, 'Topic B', '#22c55e', 90),
      circle('c3', 80, 300, 'Topic C', '#f59e0b', 90),
      circle('c4', 500, 300, 'Topic D', '#ef4444', 90),
    ],
    edges: [
      edge('e1', 'c0', 'c1'), edge('e2', 'c0', 'c2'),
      edge('e3', 'c0', 'c3'), edge('e4', 'c0', 'c4'),
    ],
  },
  {
    id: 'user-journey', name: 'User Journey Map', category: 'UX',
    nodes: [
      frame('f1', 20, 20, 'Discover', 140, 280),
      frame('f2', 180, 20, 'Evaluate', 140, 280),
      frame('f3', 340, 20, 'Purchase', 140, 280),
      frame('f4', 500, 20, 'Onboard', 140, 280),
      sticky('s1', 30, 80, 'Search ads', '#bbf7d0', 120, 80),
      sticky('s2', 190, 80, 'Compare', '#fef08a', 120, 80),
      sticky('s3', 350, 80, 'Checkout', '#fecaca', 120, 80),
      sticky('s4', 510, 80, 'Setup wizard', '#bfdbfe', 120, 80),
    ],
    edges: [],
  },
  {
    id: 'system-arch', name: 'System Architecture', category: 'Engineering',
    nodes: [
      rect('r1', 240, 20, 'Load Balancer', '#3b82f6', 200, 60),
      rect('r2', 60, 140, 'API Server 1', '#8b5cf6', 180, 60),
      rect('r3', 440, 140, 'API Server 2', '#8b5cf6', 180, 60),
      rect('r4', 60, 280, 'PostgreSQL', '#a855f7', 180, 60),
      rect('r5', 260, 280, 'Redis Cache', '#ef4444', 160, 60),
      rect('r6', 440, 280, 'Message Queue', '#f59e0b', 180, 60),
    ],
    edges: [
      edge('e1', 'r1', 'r2'), edge('e2', 'r1', 'r3'),
      edge('e3', 'r2', 'r4'), edge('e4', 'r3', 'r6'), edge('e5', 'r2', 'r5'),
    ],
  },
  {
    id: 'kanban-board', name: 'Kanban Board', category: 'Project Mgmt',
    nodes: [
      frame('f1', 20, 20, 'To Do', 180, 360),
      frame('f2', 220, 20, 'In Progress', 180, 360),
      frame('f3', 420, 20, 'Review', 180, 360),
      frame('f4', 620, 20, 'Done', 160, 360),
      sticky('s1', 30, 70, 'Task 1', '#fef08a', 160, 70),
      sticky('s2', 30, 155, 'Task 2', '#fef08a', 160, 70),
      sticky('s3', 30, 240, 'Task 3', '#fef08a', 160, 70),
      sticky('s4', 230, 70, 'Task 4', '#bfdbfe', 160, 70),
      sticky('s5', 230, 155, 'Task 5', '#bfdbfe', 160, 70),
      sticky('s6', 430, 70, 'Task 6', '#e9d5ff', 160, 70),
      sticky('s7', 630, 70, 'Task 7', '#bbf7d0', 140, 70),
      sticky('s8', 630, 155, 'Task 8', '#bbf7d0', 140, 70),
    ],
    edges: [],
  },
];
